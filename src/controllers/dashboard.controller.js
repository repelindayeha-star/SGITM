const dashboardService = require('../services/dashboard.service');

async function obtenerResumen(req, res, next) {
  try {
    const resumen = await dashboardService.obtenerResumen();
    res.status(200).json({ exito: true, data: resumen });
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerResumen };