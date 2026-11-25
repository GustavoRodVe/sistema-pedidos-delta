// Controlador de Categorías (solo el administrador): listar y registrar.
const Categoria = require('../models/categoriaModel');
const { validarCategoria } = require('../validators/categoriaValidator');

const MENSAJES = {
  registrada: 'La categoría se registró correctamente.'
};

async function mostrar(res, { categoria = {}, errores = {}, mensaje = null, status = 200 }) {
  const categorias = await Categoria.listar();
  return res.status(status).render('categorias/index', { categorias, categoria, errores, mensaje });
}

const categoriaController = {
  // GET /categorias
  async listar(req, res, next) {
    try {
      await mostrar(res, { mensaje: MENSAJES[req.query.ok] || null });
    } catch (err) {
      next(err);
    }
  },

  // POST /categorias
  async crear(req, res, next) {
    const { datos, errores } = validarCategoria(req.body);
    try {
      if (Object.keys(errores).length > 0) {
        return await mostrar(res, { categoria: datos, errores, status: 422 });
      }
      await Categoria.crear(datos);
      res.redirect('/categorias?ok=registrada');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return mostrar(res, {
          categoria: datos,
          errores: { nombre: 'Ya existe una categoría con este nombre.' },
          status: 409
        }).catch(next);
      }
      next(err);
    }
  }
};

module.exports = categoriaController;
