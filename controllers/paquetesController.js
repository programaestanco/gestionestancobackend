const supabase = require("../supabaseClient");

const PRECIOS_EMPRESA = {
  Amazon: 0.25,
  Seur: 0.25,
  CorreosExpress: 0.25,
  DHL: 0.25,
  UPS: 0.25,
  GLS: 0.25,
  CTT: 0.25,
  Celeritas: 0.25,
  MRW: 0.25,
  Otros: 0.25
};

// 🔹 PENDIENTES: devolver TODOS, sin paginación
exports.getPendientes = async (req, res) => {
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .eq("estado", "pendiente")
    .order("fecha_recibido", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
};

// 🔹 ENTREGADOS: paginación por bloques de 500
exports.getEntregados = async (req, res) => {
  const desde = parseInt(req.query.desde) || 0;
  const hasta = desde + 499;

  const { data, error, count } = await supabase
    .from("paquetes")
    .select("*", { count: "exact" })
    .eq("estado", "entregado")
    .order("fecha_entregado", { ascending: false })
    .range(desde, hasta);

  if (error) return res.status(500).json({ error });
  res.json({ data, total: count });
};

// 🔹 GET combinada (opcional si aún usas /paquetes general)
exports.getPaquetes = async (req, res) => {
  const desde = parseInt(req.query.desde) || 0;
  const hasta = desde + 499;

  const { data, error, count } = await supabase
    .from("paquetes")
    .select("*", { count: "exact" })
    .order("fecha_recibido", { ascending: false })
    .range(desde, hasta);

  if (error) return res.status(500).json({ error });
  res.json({ data, total: count });
};

exports.registrarPaquete = async (req, res) => {
  const { cliente, compania, compartimento } = req.body;

  if (!cliente || !compania || !compartimento) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const { error } = await supabase.from("paquetes").insert([
    { cliente, compania, compartimento }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
};

exports.entregarPaquete = async (req, res) => {
  const { id } = req.params;

  const { data, error: getError } = await supabase
    .from("paquetes")
    .select("*")
    .eq("id", id)
    .single();

  if (getError) return res.status(500).json({ error: getError });

  const normalizar = (str) => (str || "").trim().replace(/\s+/g, "").toLowerCase();
  const clave = Object.keys(PRECIOS_EMPRESA).find(
    (k) => normalizar(k) === normalizar(data.compania)
  ) || "Otros";

  const precio = PRECIOS_EMPRESA[clave];

  // Obtener fecha/hora local (no UTC)
  const ahoraLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19); // "YYYY-MM-DD HH:mm:ss"

  const { error: updateError } = await supabase
    .from("paquetes")
    .update({
      estado: "entregado",
      fecha_entregado: ahoraLocal,
      precio
    })
    .eq("id", id);

  if (updateError) return res.status(500).json({ error: updateError });
  res.json({ success: true });
};

exports.eliminarPaquete = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("paquetes").delete().eq("id", id);
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
};

exports.getIngresos = async (req, res) => {
  const { data, error } = await supabase
    .from("paquetes")
    .select("precio")
    .eq("estado", "entregado");

  if (error) return res.status(500).json({ error });

  const total = data.reduce((acc, p) => acc + parseFloat(p.precio || 0), 0);
  res.json({ total });
};

// 👇 Función usada por la sección de devoluciones (desactivada)
/*
exports.marcarPendiente = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("paquetes")
    .update({
      estado: "pendiente",
      fecha_entregado: null,
      precio: null
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
};
*/

exports.editarPaquete = async (req, res) => {
  const { id } = req.params;
  const { cliente, compania, compartimento } = req.body;

  if (!cliente || !compania || !compartimento) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const { error } = await supabase
    .from("paquetes")
    .update({ cliente, compania, compartimento })
    .eq("id", id);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
};
// 🔍 Buscar paquetes por cliente (sin límite de fecha o paginación)
exports.buscarPorCliente = async (req, res) => {
  const { cliente } = req.query;
  if (!cliente || cliente.trim().length < 2) {
    return res.status(400).json({ error: "Falta o es demasiado corto el parámetro 'cliente'" });
  }

  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .ilike("cliente", `%${cliente}%`)
    .order("fecha_recibido", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
};
