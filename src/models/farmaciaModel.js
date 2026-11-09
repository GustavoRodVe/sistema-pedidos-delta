// Modelo Farmacia: única parte que consulta y modifica la tabla farmacia.
// Todas las consultas usan parámetros (?) para evitar inyección SQL.
const { pool } = require('../config/db');

const Farmacia = {
  // Lista las farmacias activas. Si llega un texto, filtra por nombre o NIT.
  async listarActivas(buscar) {
    let sql = `SELECT id_farmacia, nombre, nit, responsable, telefono, direccion, zona
               FROM farmacia WHERE activo = 1`;
    const params = [];
    if (buscar) {
      sql += ' AND (nombre LIKE ? OR nit LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`);
    }
    sql += ' ORDER BY nombre';
    const [filas] = await pool.query(sql, params);
    return filas;
  },

  async buscarPorId(id) {
    const [filas] = await pool.query(
      `SELECT id_farmacia, nombre, nit, responsable, telefono, direccion, zona, activo, fecha_registro
       FROM farmacia WHERE id_farmacia = ?`,
      [id]
    );
    return filas[0] || null;
  },

  async crear(datos) {
    const [resultado] = await pool.query(
      `INSERT INTO farmacia (nombre, nit, responsable, telefono, direccion, zona)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [datos.nombre, datos.nit, datos.responsable, datos.telefono, datos.direccion, datos.zona]
    );
    return resultado.insertId;
  },

  async actualizar(id, datos) {
    const [resultado] = await pool.query(
      `UPDATE farmacia
       SET nombre = ?, nit = ?, responsable = ?, telefono = ?, direccion = ?, zona = ?
       WHERE id_farmacia = ? AND activo = 1`,
      [datos.nombre, datos.nit, datos.responsable, datos.telefono, datos.direccion, datos.zona, id]
    );
    return resultado.affectedRows;
  },

  // Eliminación lógica: la fila se conserva porque puede tener pedidos asociados.
  async desactivar(id) {
    const [resultado] = await pool.query(
      'UPDATE farmacia SET activo = 0 WHERE id_farmacia = ? AND activo = 1',
      [id]
    );
    return resultado.affectedRows;
  }
};

module.exports = Farmacia;
