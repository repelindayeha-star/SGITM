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
    negocio,
  ] = await Promise.all([
    dashboardRepository.contarOrdenesPorEstado(),
    dashboardRepository.contarClientes(),
    dashboardRepository.contarMotocicletas(),
    dashboardRepository.contarCitasProximas(),
    dashboardRepository.sumarIngresosFacturados(),
    dashboardRepository.contarFacturas(),
    inventarioService.listarStockBajo(),
    // Vista de negocio: cuanto entro, de donde salio y que produjo cada
    // mecanico. Es lo que le sirve al dueno del taller.
    dashboardRepository.resumirNegocio(),
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
    negocio,
  };
}

module.exports = { obtenerResumen };
