// Punto de entrada de la aplicación web del Laboratorio Químico Delta.
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const { probarConexion } = require('./config/db');
const farmaciaRoutes = require('./routes/farmaciaRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const { inicioController } = require('./controllers/inicioController');

const app = express();
const PUERTO = Number(process.env.PORT) || 3000;

// Motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos (CSS) y lectura de formularios
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));

// Registro de cada solicitud en la consola (método, ruta, código de respuesta y
// tiempo). Sirve para comprobar que las acciones de la interfaz llegan al servidor.
app.use((req, res, next) => {
  if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/img/')) return next();
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
});

// Variables disponibles en todas las vistas: ruta actual para marcar el menú
// activo y dirección completa para el botón "Reintentar".
app.use((req, res, next) => {
  res.locals.rutaActual = req.path;
  res.locals.urlActual = req.originalUrl;
  next();
});

app.get('/', inicioController.panel);
app.use('/farmacias', farmaciaRoutes);
app.use('/medicamentos', medicamentoRoutes);

// Ruta inexistente
app.use((req, res) => {
  res.status(404).render('errores/404', {
    titulo: 'Página no encontrada',
    mensaje: 'La dirección que intenta abrir no existe.',
    volver: '/'
  });
});

// Códigos que indican que MySQL no responde (servicio detenido, red o acceso).
const ERRORES_CONEXION = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_CON_COUNT_ERROR'];

// Manejo centralizado de errores: el detalle técnico queda en la consola
// y al usuario solo se le muestra un mensaje general.
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error en ${req.method} ${req.originalUrl}:`, err.code || err.message);
  if (ERRORES_CONEXION.includes(err.code)) {
    // Para reintentar se vuelve a pedir la misma página; si era un envío de
    // formulario se vuelve a la página anterior para no reenviar datos.
    const reintentar = req.method === 'GET' ? req.originalUrl : (req.get('Referer') || '/');
    return res.status(503).render('errores/sin-conexion', { reintentar });
  }
  res.status(500).render('errores/500');
});

async function iniciar() {
  try {
    const base = await probarConexion();
    console.log(`Conexión a MySQL establecida (base de datos: ${base})`);
  } catch (err) {
    console.error('No se pudo conectar a MySQL. Revise los datos del archivo .env.');
    console.error('Detalle:', err.code || err.message);
    process.exit(1);
  }
  const servidor = app.listen(PUERTO, () => {
    console.log(`Servidor iniciado en http://localhost:${PUERTO}`);
  });
  // Si el puerto está ocupado se muestra un mensaje claro en lugar de la traza completa.
  servidor.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`El puerto ${PUERTO} ya está en uso. Cierre la otra instancia o cambie PORT en el archivo .env.`);
    } else {
      console.error('No se pudo iniciar el servidor:', err.message);
    }
    process.exit(1);
  });
}

iniciar();
