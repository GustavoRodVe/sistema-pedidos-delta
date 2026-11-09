// Punto de entrada de la aplicación web del Laboratorio Químico Delta.
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const { probarConexion } = require('./config/db');
const farmaciaRoutes = require('./routes/farmaciaRoutes');
const medicamentoRoutes = require('./routes/medicamentoRoutes');

const app = express();
const PUERTO = Number(process.env.PORT) || 3000;

// Motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos (CSS) y lectura de formularios
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));

// Variable disponible en todas las vistas para marcar el menú activo
app.use((req, res, next) => {
  res.locals.rutaActual = req.path;
  next();
});

app.get('/', (req, res) => res.render('inicio'));
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

// Manejo centralizado de errores: el detalle técnico queda en la consola
// y al usuario solo se le muestra un mensaje general.
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error en ${req.method} ${req.originalUrl}:`, err.message);
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
