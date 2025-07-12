const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paquetesController");

router.get("/buscar", ctrl.buscarPorCliente); // 🔍 Buscar por cliente (sin límite)

router.get("/", ctrl.getPaquetes); // Ruta general (opcional)
router.get("/pendientes", ctrl.getPendientes); // 🔹 Todos los pendientes sin paginación
router.get("/entregados", ctrl.getEntregados); // 🔹 Entregados paginados por ?desde=

router.post("/", ctrl.registrarPaquete);
router.post("/entregar/:id", ctrl.entregarPaquete);

// ⚠️ Descomentar solo si está activa en el controller
// router.put("/pendiente/:id", ctrl.marcarPendiente);

router.put("/:id", ctrl.editarPaquete);
router.delete("/:id", ctrl.eliminarPaquete);
router.get("/ingresos/total", ctrl.getIngresos);

module.exports = router;
