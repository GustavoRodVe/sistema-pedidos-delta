// Modelo Rol: se consulta para elegir el rol al registrar un usuario.
const { pool } = require('../config/db');

const Rol = {
  async listar() {
    const [filas] = await pool.query('SELECT id_rol, nombre FROM rol ORDER BY id_rol');
    return filas;
  },

  async existe(id) {
    const [filas] = await pool.query('SELECT 1 FROM rol WHERE id_rol = ?', [id]);
    return filas.length > 0;
  }
};

module.exports = Rol;
