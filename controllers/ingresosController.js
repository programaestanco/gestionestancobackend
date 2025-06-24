const supabase = require("../supabaseClient");

exports.getIngresos = async (req, res) => {
  try {
    const periodo = req.query.periodo || "anual";
    const fechaParam = req.query.fecha;
    const PRECIO_ENTREGA = 0.25;

    const { data, error } = await supabase
      .from("paquetes")
      .select("estado, fecha_entregado");

    if (error) {
      console.error("❌ Error al consultar Supabase:", error);
      return res.status(500).json({ error: "Error al consultar datos" });
    }

    const agrupados = {};

    let inicioDia = null;
    let finDia = null;

    if (periodo === "diaria" && fechaParam) {
      const [año, mes, dia] = fechaParam.split("-");
      inicioDia = new Date(año, mes - 1, dia, 0, 0, 0);
      finDia = new Date(año, mes - 1, dia, 23, 59, 59, 999);

      for (let h = 0; h < 24; h++) {
        const clave = h.toString().padStart(2, "0");
        agrupados[clave] = { ingresos: 0 };
      }
    }

    const getClave = (date) => {
      if (!(date instanceof Date) || isNaN(date)) return null;
      switch (periodo) {
        case "mensual":
          return date.getDate().toString().padStart(2, "0");
        case "semanal":
          return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
        case "historial":
          return date.toISOString().split("T")[0];
        case "diaria":
          return date.getHours().toString().padStart(2, "0");
        case "anual":
        default:
          return date.toLocaleString("es-ES", { month: "short" }).replace(/^./, m => m.toUpperCase());
      }
    };

    for (const p of data) {
      if (p.estado !== "entregado" || !p.fecha_entregado) continue;
      const fecha = new Date(p.fecha_entregado);

      if (periodo === "diaria" && (fecha < inicioDia || fecha > finDia)) continue;

      const clave = getClave(fecha);
      if (!clave) continue;

      agrupados[clave] = agrupados[clave] || { ingresos: 0 };
      agrupados[clave].ingresos += PRECIO_ENTREGA;
    }

    const resultado = Object.entries(agrupados).map(([periodo, valores]) => ({
      periodo,
      ...valores,
    }));

    // Orden
    if (periodo === "anual") {
      const ordenMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      resultado.sort((a, b) => ordenMeses.indexOf(a.periodo) - ordenMeses.indexOf(b.periodo));
    } else if (periodo === "semanal") {
      const ordenDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      resultado.sort((a, b) => ordenDias.indexOf(a.periodo) - ordenDias.indexOf(b.periodo));
    } else if (periodo === "mensual" || periodo === "diaria") {
      resultado.sort((a, b) => parseInt(a.periodo) - parseInt(b.periodo));
    } else if (periodo === "historial") {
      resultado.sort((a, b) => new Date(a.periodo) - new Date(b.periodo));
    }

    res.json(resultado);
  } catch (err) {
    console.error("❌ Error inesperado:", err);
    res.status(500).json({ error: "Error inesperado en el servidor" });
  }
};
