// Rutas del módulo Medicamentos.
// Todos los roles pueden ver el catálogo; registrar, editar y desactivar es solo del administrador.
const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');
const { ROLES, permitirRoles } = require('../middlewares/autenticacion');

const router = express.Router();
const soloAdmin = permitirRoles(ROLES.ADMIN);

router.get('/', medicamentoController.listar);
router.get('/nuevo', soloAdmin, medicamentoController.formularioNuevo);
router.post('/', soloAdmin, medicamentoController.crear);
router.get('/:id', medicamentoController.detalle);
router.get('/:id/editar', soloAdmin, medicamentoController.formularioEditar);
router.post('/:id/editar', soloAdmin, medicamentoController.actualizar);
router.post('/:id/desactivar', soloAdmin, medicamentoController.desactivar);

module.exports = router;
