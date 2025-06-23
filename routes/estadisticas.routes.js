const express = require("express");
const router = express.Router();
const { getVolumenPaquetes } = require("../controllers/estadisticasController");

router.get("/volumen", getVolumenPaquetes);

module.exports = router;
