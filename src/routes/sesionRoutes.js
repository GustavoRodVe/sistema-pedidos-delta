// Rutas de inicio y cierre de sesión. No piden sesión porque son la forma de obtenerla.
const express = require('express');
const sesionController = require('../controllers/sesionController');

const router = express.Router();

router.get('/login', sesionController.formulario);
router.post('/login', sesionController.iniciar);
router.post('/logout', sesionController.cerrar);

module.exports = router;
