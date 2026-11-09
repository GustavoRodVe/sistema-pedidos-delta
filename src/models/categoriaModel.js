// Modelo Categoria: en esta actividad solo se consulta, para el combo del formulario
// de medicamentos y para comprobar que la categoría elegida existe.
const { pool } = require('../config/db');

const Categoria = {
  async listar() {
    const [filas] = await pool.query('SELECT id_categoria, nombre FROM categoria ORDER BY nombre');
    return filas;
  },

  async existe(id) {
    const [filas] = await pool.query('SELECT 1 FROM categoria WHERE id_categoria = ?', [id]);
    return filas.length > 0;
  }
};

module.exports = Categoria;
