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
  }
};

module.exports = Usuario;
