// Controlador de Pedidos: registro, listado, detalle y cambios de estado
// (despachar, entregar y anular).
const Pedido = require('../models/pedidoModel');
const Farmacia = require('../models/farmaciaModel');
const Medicamento = require('../models/medicamentoModel');
const { validarPedido, ESTADOS } = require('../validators/pedidoValidator');

const MENSAJES = {
  registrado: 'El pedido se registró correctamente.',
  despachado: 'El pedido fue despachado y el stock se descontó.',
  entregado: 'El pedido quedó marcado como entregado.',
  anulado: 'El pedido fue anulado.'
};

function leerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function noEncontrado(res) {
  return res.status(404).render('errores/404', {
    titulo: 'Pedido no encontrado',
    mensaje: 'El pedido que busca no existe.',
    volver: '/pedidos'
  });
}

async function mostrarFormulario(res, { pedido, errores = {}, status = 200 }) {
  const [farmacias, medicamentos] = await Promise.all([
    Farmacia.listarActivas(''),
    Medicamento.listarActivos(null)
  ]);
  return res.status(status).render('pedidos/form', { pedido, errores, farmacias, medicamentos });
}

// Muestra el detalle del pedido, con un mensaje de éxito o de error si hace falta.
async function mostrarDetalle(res, id, { mensaje = null, error = null, status = 200 } = {}) {
  const pedido = await Pedido.buscarPorId(id);
  if (!pedido) return noEncontrado(res);
  const lineas = await Pedido.listarDetalle(id);
  return res.status(status).render('pedidos/detalle', { pedido, lineas, mensaje, error });
}

const pedidoController = {
  // GET /pedidos
  async listar(req, res, next) {
    try {
      // Los filtros se validan: el estado debe estar en la lista permitida y la farmacia ser un id válido.
      const estado = ESTADOS.includes(req.query.estado) ? req.query.estado : '';
      const idFarmacia = Number.parseInt(req.query.farmacia, 10) || null;
      const [pedidos, farmacias] = await Promise.all([
        Pedido.listar({ estado, idFarmacia }),
        Farmacia.listarActivas('')
      ]);
      res.render('pedidos/index', { pedidos, farmacias, estado, idFarmacia, ESTADOS });
    } catch (err) {
      next(err);
    }
  },

  // GET /pedidos/nuevo
  async formularioNuevo(req, res, next) {
    try {
      await mostrarFormulario(res, { pedido: { id_farmacia: '', observacion: '', lineas: [{ id_medicamento: '', cantidad: '' }] } });
    } catch (err) {
      next(err);
    }
  },

  // POST /pedidos
  async crear(req, res, next) {
    try {
      const { datos, errores } = validarPedido(req.body);
      if (!errores.id_farmacia) {
        const farmacia = await Farmacia.buscarPorId(datos.id_farmacia);
        if (!farmacia || !farmacia.activo) {
          errores.id_farmacia = 'La farmacia seleccionada no existe o fue desactivada.';
        }
      }
      if (Object.keys(errores).length > 0) {
        if (datos.lineas.length === 0) datos.lineas.push({ id_medicamento: '', cantidad: '' });
        return await mostrarFormulario(res, { pedido: datos, errores, status: 422 });
      }
      const idPedido = await Pedido.crear({
        idFarmacia: datos.id_farmacia,
        // El usuario sale de la sesión, nunca del formulario.
        idUsuario: req.session.usuario.id_usuario,
        observacion: datos.observacion,
        lineas: datos.lineas.map((l) => ({ id_medicamento: Number(l.id_medicamento), cantidad: Number(l.cantidad) }))
      });
      if (idPedido === null) {
        errores.lineas = 'Uno de los medicamentos ya no está disponible. Revise el pedido.';
        return await mostrarFormulario(res, { pedido: datos, errores, status: 422 });
      }
      res.redirect(`/pedidos/${idPedido}?ok=registrado`);
    } catch (err) {
      next(err);
    }
  },

  // GET /pedidos/:id
  async detalle(req, res, next) {
    try {
      const id = leerId(req);
      if (!id) return noEncontrado(res);
      await mostrarDetalle(res, id, { mensaje: MENSAJES[req.query.ok] || null });
    } catch (err) {
      next(err);
    }
  },

  // POST /pedidos/:id/despachar
  async despachar(req, res, next) {
    try {
      const id = leerId(req);
      if (!id) return noEncontrado(res);
      const resultado = await Pedido.despachar(id);
      if (!resultado.existe) return noEncontrado(res);
      if (resultado.faltantes) {
        const lista = resultado.faltantes
          .map((f) => `${f.nombre} ${f.presentacion} (pide ${f.cantidad}, hay ${f.stock})`)
          .join('; ');
        return await mostrarDetalle(res, id, {
          status: 409,
          error: `No se puede despachar el pedido porque el stock no alcanza para: ${lista}.`
        });
      }
      if (!resultado.ok) {
        return await mostrarDetalle(res, id, {
          status: 409,
          error: `Solo un pedido pendiente se puede despachar. Este pedido está ${resultado.estado}.`
        });
      }
      res.redirect(`/pedidos/${id}?ok=despachado`);
    } catch (err) {
      next(err);
    }
  },

  // POST /pedidos/:id/entregar
  async entregar(req, res, next) {
    await cambiarEstado(req, res, next, {
      accion: Pedido.entregar,
      ok: 'entregado',
      aviso: 'Solo un pedido despachado se puede marcar como entregado.'
    });
  },

  // POST /pedidos/:id/anular
  async anular(req, res, next) {
    await cambiarEstado(req, res, next, {
      accion: Pedido.anular,
      ok: 'anulado',
      aviso: 'Solo un pedido pendiente se puede anular.'
    });
  }
};

// Parte común de entregar y anular: si el modelo no cambió ninguna fila, el pedido
// no existe o no estaba en el estado correcto, y se responde con 404 o 409.
async function cambiarEstado(req, res, next, { accion, ok, aviso }) {
  try {
    const id = leerId(req);
    if (!id) return noEncontrado(res);
    const cambiadas = await accion(id);
    if (cambiadas === 0) {
      const pedido = await Pedido.buscarPorId(id);
      if (!pedido) return noEncontrado(res);
      return await mostrarDetalle(res, id, { status: 409, error: `${aviso} Este pedido está ${pedido.estado}.` });
    }
    res.redirect(`/pedidos/${id}?ok=${ok}`);
  } catch (err) {
    next(err);
  }
}

module.exports = pedidoController;
