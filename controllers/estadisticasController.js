const supabase = require("../supabaseClient");

exports.getVolumenPaquetes = async (req, res) => {
  try {
    const periodo = req.query.periodo || "anual";

    const { data, error } = await supabase
      .from("paquetes")
      .select("fecha_recibido, fecha_entregado");

    if (error) {
      console.error("❌ Error al consultar Supabase:", error);
      return res.status(500).json({ error: "Error al consultar datos" });
    }

    const agrupados = {};

    data.forEach((p) => {
      const recibido = p.fecha_recibido ? new Date(p.fecha_recibido) : null;
      const entregado = p.fecha_entregado ? new Date(p.fecha_entregado) : null;

      const getClave = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return null;
        if (periodo === "mensual") return date.getDate().toString().padStart(2, "0");
        if (periodo === "semanal") return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
        return date.toLocaleString("default", { month: "short" }); // anual
      };

      if (recibido) {
        const clave = getClave(recibido);
        if (!clave) return;
        if (!agrupados[clave]) agrupados[clave] = { recibidos: 0, entregados: 0 };
        agrupados[clave].recibidos++;
      }

      if (entregado) {
        const clave = getClave(entregado);
        if (!clave) return;
        if (!agrupados[clave]) agrupados[clave] = { recibidos: 0, entregados: 0 };
        agrupados[clave].entregados++;
      }
    });

    const resultado = Object.entries(agrupados).map(([periodo, valores]) => ({
      periodo,
      ...valores
    }));

    if (periodo === "anual") {
      const ordenMeses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      resultado.sort((a, b) => ordenMeses.indexOf(a.periodo) - ordenMeses.indexOf(b.periodo));
    }

    res.json(resultado);
  } catch (err) {
    console.error("❌ Error inesperado:", err);
    res.status(500).json({ error: "Error inesperado en el servidor" });
  }
};
