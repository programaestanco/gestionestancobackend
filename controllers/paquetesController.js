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

exports.getPaquetes = async (req, res) => {
  const { data, error } = await supabase
    .from("paquetes")
    .select("*")
    .order("fecha_recibido", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
};

exports.registrarPaquete = async (req, res) => {
  const { cliente, compania, compartimento } = req.body;
  const { error } = await supabase.from("paquetes").insert([
    { cliente, compania, compartimento }
  ]);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
};

exports.entregarPaquete = async (req, res) => {
  const { id } = req.params;

  const { data, error: getErr } = await supabase
    .from("paquetes")
    .select("*")
    .eq("id", id)
    .single();

  if (getErr) return res.status(500).json({ error: getErr });

  const normalizar = (str) => (str || "").trim().replace(/\s+/g, "").toLowerCase();
  const clave = Object.keys(PRECIOS_EMPRESA).find(
    (k) => normalizar(k) === normalizar(data.compania)
  ) || "Otros";

  const precio = PRECIOS_EMPRESA[clave];

  const { error } = await supabase
    .from("paquetes")
    .update({
      estado: "entregado",
      fecha_entregado: new Date(),
      precio
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error });
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
