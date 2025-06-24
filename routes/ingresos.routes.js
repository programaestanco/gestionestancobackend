const express = require("express");
const router = express.Router();
const { getIngresos } = require("../controllers/ingresosController");

router.get("/ingresos", getIngresos);

module.exports = router;
