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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
