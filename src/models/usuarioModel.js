// Modelo Usuario: acceso a la tabla usuario (con el nombre de su rol).
const { pool } = require('../config/db');

const Usuario = {
  // Se usa en el login: trae el hash de la clave para compararlo con bcrypt.
  async buscarPorCorreo(correo) {
    const [filas] = await pool.query(
      `SELECT u.id_usuario, u.nombre_completo, u.correo, u.clave_hash, u.activo, r.nombre AS rol
       FROM usuario u
       INNER JOIN rol r ON r.id_rol = u.id_rol
       WHERE u.correo = ?`,
      [correo]
    );
    return filas[0] || null;
  },

  // Lista todos los usuarios, también los inactivos, para ver quién perdió el acceso.
  async listar() {
    const [filas] = await pool.query(
      `SELECT u.id_usuario, u.nombre_completo, u.correo, u.activo, u.fecha_creacion, r.nombre AS rol
       FROM usuario u
       INNER JOIN rol r ON r.id_rol = u.id_rol
       ORDER BY u.activo DESC, u.nombre_completo`
    );
    return filas;
  },

  // Recibe la clave ya convertida en hash: este modelo nunca ve la contraseña original.
  async crear(datos, claveHash) {
    const [resultado] = await pool.query(
      'INSERT INTO usuario (nombre_completo, correo, clave_hash, id_rol) VALUES (?, ?, ?, ?)',
      [datos.nombre_completo, datos.correo, claveHash, datos.id_rol]
    );
    return resultado.insertId;
  },

  // Eliminación lógica: el usuario puede figurar como quien registró pedidos.
  async desactivar(id) {
    const [resultado] = await pool.query(
      'UPDATE usuario SET activo = 0 WHERE id_usuario = ? AND activo = 1',
      [id]
    );
    return resultado.affectedRows;
  }
};

module.exports = Usuario;
