const supabase = require("../supabaseClient");

exports.getVolumenPaquetes = async (req, res) => {
  try {
    const periodo = req.query.periodo || "anual";
    const fechaParam = req.query.fecha;
    const PRECIO_ENTREGA = 0.25;

    const { data, error } = await supabase
      .from("paquetes")
      .select("estado, fecha_recibido, fecha_entregado");

    if (error) {
      console.error("❌ Error al consultar Supabase:", error);
      return res.status(500).json({ error: "Error al consultar datos" });
    }

    const agrupados = {};

    let inicioDia = null, finDia = null;
    let inicioSemana = null, finSemana = null;

    if (periodo === "diaria" && fechaParam) {
      const [año, mes, dia] = fechaParam.split("-");
      inicioDia = new Date(año, mes - 1, dia, 0, 0, 0);
      finDia = new Date(año, mes - 1, dia, 23, 59, 59, 999);
      for (let h = 0; h < 24; h++) {
        const clave = h.toString().padStart(2, "0");
        agrupados[clave] = { recibidos: 0, entregados: 0, ingresos: 0 };
      }
    }

    if (periodo === "semanal" && fechaParam) {
      const base = new Date(fechaParam);
      const diaSemana = base.getDay();
      const offsetLunes = (diaSemana === 0 ? -6 : 1 - diaSemana);
      inicioSemana = new Date(base);
      inicioSemana.setDate(base.getDate() + offsetLunes);
      inicioSemana.setHours(0, 0, 0, 0);
      finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      finSemana.setHours(23, 59, 59, 999);
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
      const recibido = p.fecha_recibido ? new Date(p.fecha_recibido) : null;
      const entregado = p.fecha_entregado ? new Date(p.fecha_entregado) : null;

      // Recibidos
      if (
        recibido &&
        (
          (periodo === "diaria" && recibido >= inicioDia && recibido <= finDia) ||
          (periodo === "semanal" && recibido >= inicioSemana && recibido <= finSemana) ||
          (periodo !== "diaria" && periodo !== "semanal")
        )
      ) {
        const clave = getClave(recibido);
        if (!clave) continue;
        agrupados[clave] = agrupados[clave] || { recibidos: 0, entregados: 0, ingresos: 0 };
        agrupados[clave].recibidos++;
      }

      // Entregados
      if (
        p.estado === "entregado" &&
        entregado &&
        (
          (periodo === "diaria" && entregado >= inicioDia && entregado <= finDia) ||
          (periodo === "semanal" && entregado >= inicioSemana && entregado <= finSemana) ||
          (periodo !== "diaria" && periodo !== "semanal")
        )
      ) {
        const clave = getClave(entregado);
        if (!clave) continue;
        agrupados[clave] = agrupados[clave] || { recibidos: 0, entregados: 0, ingresos: 0 };
        agrupados[clave].entregados++;
        agrupados[clave].ingresos += PRECIO_ENTREGA;
      }
    }

    const resultado = Object.entries(agrupados).map(([clave, valores]) => ({
      periodo: clave,
      ...valores,
    }));

    // Ordenar correctamente según tipo
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
