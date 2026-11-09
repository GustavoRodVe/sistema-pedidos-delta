// Modelo Medicamento: acceso a la tabla medicamento (con su categoría).
const { pool } = require('../config/db');

const Medicamento = {
  async listarActivos(idCategoria) {
    let sql = `SELECT m.id_medicamento, m.nombre, m.presentacion, m.precio_mayorista, m.stock,
                      c.nombre AS categoria
               FROM medicamento m
               INNER JOIN categoria c ON c.id_categoria = m.id_categoria
               WHERE m.activo = 1`;
    const params = [];
    if (idCategoria) {
      sql += ' AND m.id_categoria = ?';
      params.push(idCategoria);
    }
    sql += ' ORDER BY m.nombre';
    const [filas] = await pool.query(sql, params);
    return filas;
  },

  async buscarPorId(id) {
    const [filas] = await pool.query(
      `SELECT m.id_medicamento, m.nombre, m.presentacion, m.id_categoria, m.precio_mayorista,
              m.stock, m.activo, c.nombre AS categoria
       FROM medicamento m
       INNER JOIN categoria c ON c.id_categoria = m.id_categoria
       WHERE m.id_medicamento = ?`,
      [id]
    );
    return filas[0] || null;
  },

  async crear(datos) {
    const [resultado] = await pool.query(
      `INSERT INTO medicamento (nombre, presentacion, id_categoria, precio_mayorista, stock)
       VALUES (?, ?, ?, ?, ?)`,
      [datos.nombre, datos.presentacion, datos.id_categoria, datos.precio_mayorista, datos.stock]
    );
    return resultado.insertId;
  },

  async actualizar(id, datos) {
    const [resultado] = await pool.query(
      `UPDATE medicamento
       SET nombre = ?, presentacion = ?, id_categoria = ?, precio_mayorista = ?, stock = ?
       WHERE id_medicamento = ? AND activo = 1`,
      [datos.nombre, datos.presentacion, datos.id_categoria, datos.precio_mayorista, datos.stock, id]
    );
    return resultado.affectedRows;
  },

  // Eliminación lógica: el medicamento puede figurar en detalles de pedidos anteriores.
  async desactivar(id) {
    const [resultado] = await pool.query(
      'UPDATE medicamento SET activo = 0 WHERE id_medicamento = ? AND activo = 1',
      [id]
    );
    return resultado.affectedRows;
  }
};

module.exports = Medicamento;
