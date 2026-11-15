// Controlador de la página principal: arma el panel con cifras reales
// obtenidas de la base de datos.
const Farmacia = require('../models/farmaciaModel');
const Medicamento = require('../models/medicamentoModel');

// Por debajo de esta cantidad se considera que el medicamento tiene stock bajo.
const STOCK_MINIMO = 100;

const inicioController = {
  // GET /
  async panel(req, res, next) {
    try {
      const [totalFarmacias, totalMedicamentos, stockBajo] = await Promise.all([
        Farmacia.contarActivas(),
        Medicamento.contarActivos(),
        Medicamento.listarStockBajo(STOCK_MINIMO)
      ]);
      res.render('inicio', { totalFarmacias, totalMedicamentos, stockBajo, STOCK_MINIMO });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { inicioController, STOCK_MINIMO };
