// Rutas de reportes (el acceso solo para administradores se controla en app.js).
const express = require('express');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

router.get('/pedidos', reporteController.pedidos);

module.exports = router;
