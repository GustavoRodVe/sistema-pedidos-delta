// Rutas del módulo Farmacias. Cada ruta llama a una acción del controlador.
// Como los formularios HTML solo envían GET y POST, la edición y la
// desactivación usan POST con una ruta propia.
const express = require('express');
const farmaciaController = require('../controllers/farmaciaController');

const router = express.Router();

router.get('/', farmaciaController.listar);
router.get('/nueva', farmaciaController.formularioNueva);
router.post('/', farmaciaController.crear);
router.get('/:id', farmaciaController.detalle);
router.get('/:id/editar', farmaciaController.formularioEditar);
router.post('/:id/editar', farmaciaController.actualizar);
router.post('/:id/desactivar', farmaciaController.desactivar);

module.exports = router;
