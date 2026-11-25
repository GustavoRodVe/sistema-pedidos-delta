// Rutas del módulo Categorías (el acceso solo para administradores se controla en app.js).
const express = require('express');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

router.get('/', categoriaController.listar);
router.post('/', categoriaController.crear);

module.exports = router;
