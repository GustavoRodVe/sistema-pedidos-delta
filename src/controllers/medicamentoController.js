// Controlador de Medicamentos.
const Medicamento = require('../models/medicamentoModel');
const Categoria = require('../models/categoriaModel');
const { validarMedicamento } = require('../validators/medicamentoValidator');

const MENSAJES = {
  registrado: 'El medicamento se registró correctamente.',
  actualizado: 'Los datos del medicamento se actualizaron correctamente.',
  desactivado: 'El medicamento fue desactivado y ya no aparece en el catálogo.'
};

function leerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function noEncontrado(res) {
  return res.status(404).render('errores/404', {
    titulo: 'Medicamento no encontrado',
    mensaje: 'El medicamento que busca no existe o fue desactivado.',
    volver: '/medicamentos'
  });
}

async function mostrarFormulario(res, { medicamento, errores = {}, modo, status = 200 }) {
  const categorias = await Categoria.listar();
  return res.status(status).render('medicamentos/form', { medicamento, errores, modo, categorias });
}

// Revisa las reglas que dependen de la base de datos (categoría existente).
async function validarCompleto(body) {
  const resultado = validarMedicamento(body);
  if (!resultado.errores.id_categoria && !(await Categoria.existe(resultado.datos.id_categoria))) {
    resultado.errores.id_categoria = 'La categoría seleccionada no existe.';
  }
  return resultado;
}

const DUPLICADO = 'Ya existe un medicamento con el mismo nombre y presentación.';

const medicamentoController = {
  // GET /medicamentos
  async listar(req, res, next) {
    try {
      const idCategoria = Number.parseInt(req.query.categoria, 10) || null;
      const [medicamentos, categorias] = await Promise.all([
        Medicamento.listarActivos(idCategoria),
        Categoria.listar()
      ]);
      res.render('medicamentos/index', {
        medicamentos, categorias, idCategoria, mensaje: MENSAJES[req.query.ok] || null
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /medicamentos/nuevo
  async formularioNuevo(req, res, next) {
    try {
      await mostrarFormulario(res, { medicamento: {}, modo: 'nuevo' });
    } catch (err) {
      next(err);
    }
  },

  // POST /medicamentos
  async crear(req, res, next) {
    try {
      const { datos, errores } = await validarCompleto(req.body);
      if (Object.keys(errores).length > 0) {
        return await mostrarFormulario(res, { medicamento: datos, errores, modo: 'nuevo', status: 422 });
      }
      try {
        await Medicamento.crear(datos);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return await mostrarFormulario(res, {
            medicamento: datos, errores: { nombre: DUPLICADO }, modo: 'nuevo', status: 409
          });
        }
        throw err;
      }
      res.redirect('/medicamentos?ok=registrado');
    } catch (err) {
      next(err);
    }
  },

  // GET /medicamentos/:id
  async detalle(req, res, next) {
    try {
      const id = leerId(req);
      const medicamento = id && await Medicamento.buscarPorId(id);
      if (!medicamento || !medicamento.activo) return noEncontrado(res);
      res.render('medicamentos/detalle', { medicamento, mensaje: MENSAJES[req.query.ok] || null });
    } catch (err) {
      next(err);
    }
  },

  // GET /medicamentos/:id/editar
  async formularioEditar(req, res, next) {
    try {
      const id = leerId(req);
      const medicamento = id && await Medicamento.buscarPorId(id);
      if (!medicamento || !medicamento.activo) return noEncontrado(res);
      await mostrarFormulario(res, { medicamento, modo: 'editar' });
    } catch (err) {
      next(err);
    }
  },

  // POST /medicamentos/:id/editar
  async actualizar(req, res, next) {
    try {
      const id = leerId(req);
      if (!id) return noEncontrado(res);
      const { datos, errores } = await validarCompleto(req.body);
      datos.id_medicamento = id;
      if (Object.keys(errores).length > 0) {
        return await mostrarFormulario(res, { medicamento: datos, errores, modo: 'editar', status: 422 });
      }
      let cambiadas;
      try {
        cambiadas = await Medicamento.actualizar(id, datos);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return await mostrarFormulario(res, {
            medicamento: datos, errores: { nombre: DUPLICADO }, modo: 'editar', status: 409
          });
        }
        throw err;
      }
      if (cambiadas === 0) return noEncontrado(res);
      res.redirect(`/medicamentos/${id}?ok=actualizado`);
    } catch (err) {
      next(err);
    }
  },

  // POST /medicamentos/:id/desactivar
  async desactivar(req, res, next) {
    try {
      const id = leerId(req);
      const cambiadas = id ? await Medicamento.desactivar(id) : 0;
      if (cambiadas === 0) return noEncontrado(res);
      res.redirect('/medicamentos?ok=desactivado');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = medicamentoController;
