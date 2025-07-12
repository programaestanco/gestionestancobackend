const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paquetesController");

router.get("/", ctrl.getPaquetes);
router.post("/", ctrl.registrarPaquete);
router.post("/entregar/:id", ctrl.entregarPaquete);
router.put("/pendiente/:id", ctrl.marcarPendiente);
router.put("/:id", ctrl.editarPaquete);
router.delete("/:id", ctrl.eliminarPaquete);
router.get("/ingresos/total", ctrl.getIngresos);

module.exports = router;
