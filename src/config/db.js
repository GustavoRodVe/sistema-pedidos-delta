// Configuración de la conexión a MySQL.
// Los datos de acceso se leen del archivo .env, que no se sube al repositorio.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'delta_pedidos',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  dateStrings: true
});

// Se usa al iniciar la aplicación para confirmar que la base responde.
async function probarConexion() {
  const [filas] = await pool.query('SELECT DATABASE() AS base');
  return filas[0].base;
}

module.exports = { pool, probarConexion };
