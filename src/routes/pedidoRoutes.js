// Rutas del módulo Pedidos. Ver el listado y el detalle está abierto a todos los roles;
// cada cambio de estado se limita al rol que le corresponde. Todos los cambios son POST.
const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { ROLES, permitirRoles } = require('../middlewares/autenticacion');

const router = express.Router();
const registra = permitirRoles(ROLES.ADMIN, ROLES.VENTAS);
const despacha = permitirRoles(ROLES.ADMIN, ROLES.ALMACEN);

router.get('/', pedidoController.listar);
router.get('/nuevo', registra, pedidoController.formularioNuevo);
router.post('/', registra, pedidoController.crear);
router.get('/:id', pedidoController.detalle);
router.post('/:id/anular', registra, pedidoController.anular);
router.post('/:id/despachar', despacha, pedidoController.despachar);
router.post('/:id/entregar', despacha, pedidoController.entregar);

module.exports = router;
