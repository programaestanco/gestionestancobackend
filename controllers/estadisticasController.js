// controllers/estadisticasController.js
const supabase = require("../supabaseClient");

exports.getVolumenPaquetes = async (req, res) => {
  const periodo = req.query.periodo || "anual"; // 'anual' | 'mensual' | 'semanal'

  const { data, error } = await supabase
    .from("paquetes")
    .select("fecha_recibido, fecha_entregado");

  if (error) return res.status(500).json({ error });

  const agrupados = {};

  data.forEach((p) => {
    const recibido = p.fecha_recibido ? new Date(p.fecha_recibido) : null;
    const entregado = p.fecha_entregado ? new Date(p.fecha_entregado) : null;

    const getClave = (date) => {
      if (periodo === "mensual") return date.getDate().toString().padStart(2, "0");
      if (periodo === "semanal") return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
      return date.toLocaleString("default", { month: "short" }); // anual
    };

    if (recibido) {
      const clave = getClave(recibido);
      if (!agrupados[clave]) agrupados[clave] = { recibidos: 0, entregados: 0 };
      agrupados[clave].recibidos++;
    }

    if (entregado) {
      const clave = getClave(entregado);
      if (!agrupados[clave]) agrupados[clave] = { recibidos: 0, entregados: 0 };
      agrupados[clave].entregados++;
    }
  });

  const datos = Object.entries(agrupados).map(([periodo, valores]) => ({
    periodo,
    ...valores
  }));

  // Orden por mes si anual
  if (periodo === "anual") {
    const ordenMeses = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    datos.sort((a, b) => ordenMeses.indexOf(a.periodo) - ordenMeses.indexOf(b.periodo));
  }

  res.json(datos);
};
