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

const paquetesRoutes = require("./routes/paquetesRoutes");
app.use("/api/paquetes", paquetesRoutes);

// ✅ Ruta de salud para mantener el backend activo
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
