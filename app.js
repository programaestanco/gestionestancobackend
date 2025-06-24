const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS configurado para localhost y Vercel
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://gestionestanco.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Rutas principales
const paquetesRoutes = require("./routes/paquetesRoutes");
const estadisticasRoutes = require("./routes/estadisticas.routes");
const ingresosRoutes = require("./routes/ingresos.routes");
app.use("/api/paquetes", paquetesRoutes);
app.use("/api/stats", estadisticasRoutes);
app.use("/api/stats", ingresosRoutes);
// Ruta de salud para mantener el backend activo
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
