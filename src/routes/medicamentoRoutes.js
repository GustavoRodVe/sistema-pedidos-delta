// Rutas del módulo Medicamentos.
const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');

const router = express.Router();

router.get('/', medicamentoController.listar);
router.get('/nuevo', medicamentoController.formularioNuevo);
router.post('/', medicamentoController.crear);
router.get('/:id', medicamentoController.detalle);
router.get('/:id/editar', medicamentoController.formularioEditar);
router.post('/:id/editar', medicamentoController.actualizar);
router.post('/:id/desactivar', medicamentoController.desactivar);

module.exports = router;
