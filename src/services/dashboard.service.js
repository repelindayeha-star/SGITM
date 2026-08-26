const dashboardRepository = require('../repositories/dashboard.repository');
const inventarioService = require('./inventario.service');

async function obtenerResumen() {
  const [
    ordenesPorEstado,
    totalClientes,
    totalMotocicletas,
    citasProximas,
    ingresosFacturados,
    totalFacturas,
    repuestosStockBajo,
  ] = await Promise.all([
    dashboardRepository.contarOrdenesPorEstado(),
    dashboardRepository.contarClientes(),
    dashboardRepository.contarMotocicletas(),
    dashboardRepository.contarCitasProximas(),
    dashboardRepository.sumarIngresosFacturados(),
    dashboardRepository.contarFacturas(),
    inventarioService.listarStockBajo(),
  ]);

  return {
    ordenesPorEstado,
    totalClientes,
    totalMotocicletas,
    citasProximas,
    ingresosFacturados: Number(ingresosFacturados),
    totalFacturas,
    repuestosStockBajo: {
      cantidad: repuestosStockBajo.length,
      detalle: repuestosStockBajo,
    },
  };
}

module.exports = { obtenerResumen };
