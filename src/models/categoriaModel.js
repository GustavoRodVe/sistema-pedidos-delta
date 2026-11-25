// Modelo Categoria: se consulta para el combo del formulario de medicamentos y para
// comprobar que la categoría elegida existe; también permite registrar categorías nuevas.
const { pool } = require('../config/db');

const Categoria = {
  async listar() {
    const [filas] = await pool.query('SELECT id_categoria, nombre, descripcion FROM categoria ORDER BY nombre');
    return filas;
  },

  async existe(id) {
    const [filas] = await pool.query('SELECT 1 FROM categoria WHERE id_categoria = ?', [id]);
    return filas.length > 0;
  },

  async crear(datos) {
    const [resultado] = await pool.query(
      'INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)',
      [datos.nombre, datos.descripcion]
    );
    return resultado.insertId;
  }
};

module.exports = Categoria;
