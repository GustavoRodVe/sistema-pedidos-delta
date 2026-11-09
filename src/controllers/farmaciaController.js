// Controlador de Farmacias: recibe la solicitud, valida, llama al modelo
// y decide qué vista mostrar o a dónde redirigir.
const Farmacia = require('../models/farmaciaModel');
const { validarFarmacia, ZONAS } = require('../validators/farmaciaValidator');

const MENSAJES = {
  registrada: 'La farmacia se registró correctamente.',
  actualizada: 'Los datos de la farmacia se actualizaron correctamente.',
  desactivada: 'La farmacia fue desactivada. Su historial de pedidos se conserva.'
};

// Convierte el parámetro :id en número; si no es válido devuelve null.
function leerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function noEncontrada(res) {
  return res.status(404).render('errores/404', {
    titulo: 'Farmacia no encontrada',
    mensaje: 'La farmacia que busca no existe o fue desactivada.',
    volver: '/farmacias'
  });
}

function mostrarFormulario(res, { farmacia, errores = {}, modo, status = 200 }) {
  return res.status(status).render('farmacias/form', { farmacia, errores, modo, zonas: ZONAS });
}

const farmaciaController = {
  // GET /farmacias
  async listar(req, res, next) {
    try {
      const buscar = (req.query.buscar || '').trim();
      const farmacias = await Farmacia.listarActivas(buscar);
      res.render('farmacias/index', { farmacias, buscar, mensaje: MENSAJES[req.query.ok] || null });
    } catch (err) {
      next(err);
    }
  },

  // GET /farmacias/nueva
  formularioNueva(req, res) {
    mostrarFormulario(res, { farmacia: {}, modo: 'nueva' });
  },

  // POST /farmacias
  async crear(req, res, next) {
    const { datos, errores } = validarFarmacia(req.body);
    if (Object.keys(errores).length > 0) {
      return mostrarFormulario(res, { farmacia: datos, errores, modo: 'nueva', status: 422 });
    }
    try {
      await Farmacia.crear(datos);
      res.redirect('/farmacias?ok=registrada');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return mostrarFormulario(res, {
          farmacia: datos,
          errores: { nit: 'Ya existe una farmacia registrada con este NIT.' },
          modo: 'nueva',
          status: 409
        });
      }
      next(err);
    }
  },

  // GET /farmacias/:id
  async detalle(req, res, next) {
    try {
      const id = leerId(req);
      const farmacia = id && await Farmacia.buscarPorId(id);
      if (!farmacia || !farmacia.activo) return noEncontrada(res);
      res.render('farmacias/detalle', { farmacia, mensaje: MENSAJES[req.query.ok] || null });
    } catch (err) {
      next(err);
    }
  },

  // GET /farmacias/:id/editar
  async formularioEditar(req, res, next) {
    try {
      const id = leerId(req);
      const farmacia = id && await Farmacia.buscarPorId(id);
      if (!farmacia || !farmacia.activo) return noEncontrada(res);
      mostrarFormulario(res, { farmacia, modo: 'editar' });
    } catch (err) {
      next(err);
    }
  },

  // POST /farmacias/:id/editar
  async actualizar(req, res, next) {
    const id = leerId(req);
    if (!id) return noEncontrada(res);
    const { datos, errores } = validarFarmacia(req.body);
    datos.id_farmacia = id;
    if (Object.keys(errores).length > 0) {
      return mostrarFormulario(res, { farmacia: datos, errores, modo: 'editar', status: 422 });
    }
    try {
      const cambiadas = await Farmacia.actualizar(id, datos);
      if (cambiadas === 0) return noEncontrada(res);
      res.redirect(`/farmacias/${id}?ok=actualizada`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return mostrarFormulario(res, {
          farmacia: datos,
          errores: { nit: 'Ya existe otra farmacia registrada con este NIT.' },
          modo: 'editar',
          status: 409
        });
      }
      next(err);
    }
  },

  // POST /farmacias/:id/desactivar
  async desactivar(req, res, next) {
    try {
      const id = leerId(req);
      const cambiadas = id ? await Farmacia.desactivar(id) : 0;
      if (cambiadas === 0) return noEncontrada(res);
      res.redirect('/farmacias?ok=desactivada');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = farmaciaController;
