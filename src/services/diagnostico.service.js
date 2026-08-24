const diagnosticoRepository = require('../repositories/diagnostico.repository');
const itemRepository = require('../repositories/itemCotizacion.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const repuestoRepository = require('../repositories/repuesto.repository');
const AppError = require('../utils/AppError');

async function crearDiagnostico({ ordenId, descripcion, manoObra }) {
  const orden = await ordenRepository.buscarPorId(ordenId);
  if (!orden) {
    throw new AppError('La orden de trabajo no existe.', 404);
  }

  const existente = await diagnosticoRepository.buscarPorOrdenId(ordenId);
  if (existente) {
    throw new AppError('Esta orden ya tiene un diagnóstico registrado.', 409);
  }

  if (orden.estado !== 'EN_DIAGNOSTICO') {
    throw new AppError(
      `Solo se puede crear un diagnóstico cuando la orden está en estado EN_DIAGNOSTICO (actual: ${orden.estado}).`,
      400
    );
  }

  return diagnosticoRepository.crear({ ordenId, descripcion, manoObra });
}

async function obtenerPorOrdenId(ordenId) {
  const diagnostico = await diagnosticoRepository.buscarPorOrdenId(ordenId);
  if (!diagnostico) {
    throw new AppError('Esta orden no tiene un diagnóstico registrado.', 404);
  }
  return diagnostico;
}

async function actualizarDiagnostico(id, datos) {
  const diagnostico = await diagnosticoRepository.buscarPorId(id);
  if (!diagnostico) {
    throw new AppError('Diagnóstico no encontrado.', 404);
  }
  return diagnosticoRepository.actualizar(id, datos);
}

/**
 * Agrega un ítem a la cotización (puede o no estar ligado a un repuesto
 * existente del inventario). No descuenta stock aquí: el descuento real
 * ocurre cuando se registra el movimiento de inventario al reparar.
 */
async function agregarItem({ diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario }) {
  const diagnostico = await diagnosticoRepository.buscarPorId(diagnosticoId);
  if (!diagnostico) {
    throw new AppError('Diagnóstico no encontrado.', 404);
  }

  if (repuestoId) {
    const repuesto = await repuestoRepository.buscarPorId(repuestoId);
    if (!repuesto) {
      throw new AppError('El repuesto indicado no existe.', 404);
    }
  }

  return itemRepository.crear({ diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario });
}

async function eliminarItem(id) {
  const item = await itemRepository.buscarPorId(id);
  if (!item) {
    throw new AppError('Ítem de cotización no encontrado.', 404);
  }
  return itemRepository.eliminar(id);
}

/**
 * Calcula el total de la cotización: mano de obra + suma de (cantidad * precio) de cada ítem.
 */
async function calcularTotalCotizacion(diagnosticoId) {
  const diagnostico = await diagnosticoRepository.buscarPorId(diagnosticoId);
  if (!diagnostico) {
    throw new AppError('Diagnóstico no encontrado.', 404);
  }

  const totalItems = diagnostico.itemsCotizacion.reduce((acumulado, item) => {
    return acumulado + Number(item.cantidad) * Number(item.precioUnitario);
  }, 0);

  const manoObra = Number(diagnostico.manoObra);

  return {
    diagnosticoId,
    manoObra,
    totalItems,
    total: manoObra + totalItems,
    items: diagnostico.itemsCotizacion,
  };
}

module.exports = {
  crearDiagnostico,
  obtenerPorOrdenId,
  actualizarDiagnostico,
  agregarItem,
  eliminarItem,
  calcularTotalCotizacion,
};