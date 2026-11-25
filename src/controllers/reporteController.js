// Controlador de Reportes (solo el administrador): pedidos por farmacia y rango de fechas.
const Pedido = require('../models/pedidoModel');
const Farmacia = require('../models/farmaciaModel');

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Arma YYYY-MM-DD con la fecha local del servidor.
function aTexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Una fecha de texto es válida si cumple el formato y existe en el calendario
// (por ejemplo, 2026-02-30 no existe).
function fechaValida(texto) {
  if (!FORMATO_FECHA.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00`);
  return !Number.isNaN(fecha.getTime()) && aTexto(fecha) === texto;
}

const reporteController = {
  // GET /reportes/pedidos
  async pedidos(req, res, next) {
    try {
      const hoy = new Date();
      // Por defecto se muestra el mes en curso, del día 1 hasta hoy.
      const desde = req.query.desde || aTexto(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      const hasta = req.query.hasta || aTexto(hoy);
      const idFarmacia = Number.parseInt(req.query.farmacia, 10) || null;
      const farmacias = await Farmacia.listarActivas('');
      const vista = { farmacias, idFarmacia, desde, hasta, pedidos: [], total: 0, error: null };

      if (!fechaValida(desde) || !fechaValida(hasta)) {
        return res.status(422).render('reportes/pedidos', { ...vista, error: 'Ingrese fechas válidas.' });
      }
      if (desde > hasta) {
        return res.status(422).render('reportes/pedidos', { ...vista, error: 'La fecha desde no puede ser posterior a la fecha hasta.' });
      }

      const pedidos = await Pedido.reporte({ idFarmacia, desde, hasta });
      // El total se suma en centavos para no arrastrar errores de decimales.
      const centavos = pedidos.reduce((suma, p) => suma + Math.round(p.total * 100), 0);
      res.render('reportes/pedidos', { ...vista, pedidos, total: centavos / 100 });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reporteController;
