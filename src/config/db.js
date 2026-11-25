// Configuración de la conexión a MySQL.
// Los datos de acceso se leen del archivo .env, que no se sube al repositorio.
const mysql = require('mysql2/promise');

// Conexión cifrada (TLS) para cuando la base está en la nube, por ejemplo Aiven.
//   DB_SSL=true           cifra y comprueba el certificado con DB_CA (el contenido de ca.pem).
//                         En Render se puede pegar en una sola línea con \n entre las líneas.
//   DB_SSL=sin-verificar  cifra pero no comprueba el certificado. Es solo un plan B,
//                         porque no protege contra alguien que se haga pasar por el servidor.
// Con cualquier otro valor (o sin definirlo) no se usa TLS, que es lo normal en local.
function opcionesSsl() {
  if (process.env.DB_SSL === 'true') {
    const opciones = { rejectUnauthorized: true };
    if (process.env.DB_CA) opciones.ca = process.env.DB_CA.replace(/\\n/g, '\n');
    return opciones;
  }
  if (process.env.DB_SSL === 'sin-verificar') return { rejectUnauthorized: false };
  return undefined;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'delta_pedidos',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  dateStrings: true,
  ssl: opcionesSsl()
});

// Bolivia está en UTC-4 y no cambia de hora en verano. El servidor en la nube
// trabaja en UTC, así que cada conexión fija la zona para que NOW() guarde la hora local.
pool.on('connection', (conexion) => conexion.query("SET time_zone = '-04:00'"));

// Se usa al iniciar la aplicación para confirmar que la base responde.
async function probarConexion() {
  const [filas] = await pool.query('SELECT DATABASE() AS base');
  return filas[0].base;
}

module.exports = { pool, probarConexion };
