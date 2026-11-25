// Rutas del módulo Usuarios. El acceso solo para administradores se controla al montarlas en app.js.
const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

router.get('/', usuarioController.listar);
router.get('/nuevo', usuarioController.formularioNuevo);
router.post('/', usuarioController.crear);
router.post('/:id/desactivar', usuarioController.desactivar);

module.exports = router;
