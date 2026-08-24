const facturaRepository = require('../repositories/factura.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const diagnosticoService = require('./diagnostico.service');
const AppError = require('../utils/AppError');

const ESTADOS_FACTURABLES = ['LISTA', 'ENTREGADA'];
const METODOS_PAGO_VALIDOS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

function generarNumeroFactura() {
  const anio = new Date().getFullYear();
  const aleatorio = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  return `FAC-${anio}-${aleatorio}`;
}

async function crear({ ordenId, metodoPago }) {
  const orden = await ordenRepository.buscarPorId(ordenId);
  if (!orden) {
    throw new AppError('La orden de trabajo no existe.', 404);
  }

  if (!ESTADOS_FACTURABLES.includes(orden.estado)) {
    throw new AppError(
      `Solo se puede facturar una orden en estado LISTA o ENTREGADA (actual: ${orden.estado}).`,
      400
    );
  }

  const existente = await facturaRepository.buscarPorOrdenId(ordenId);
  if (existente) {
    throw new AppError('Esta orden ya tiene una factura generada.', 409);
  }

  if (!orden.diagnostico) {
    throw new AppError('La orden no tiene un diagnóstico/cotización registrado.', 400);
  }

  if (!METODOS_PAGO_VALIDOS.includes(metodoPago)) {
    throw new AppError(`Método de pago inválido. Válidos: ${METODOS_PAGO_VALIDOS.join(', ')}`, 400);
  }

  const resumen = await diagnosticoService.calcularTotalCotizacion(orden.diagnostico.id);

  const numero = generarNumeroFactura();

  return facturaRepository.crear({
    ordenId,
    numero,
    subtotal: resumen.total,
    total: resumen.total, // sin impuestos adicionales por ahora (facturación simple, no DIAN)
    metodoPago,
  });
}

async function obtenerPorOrdenId(ordenId) {
  const factura = await facturaRepository.buscarPorOrdenId(ordenId);
  if (!factura) {
    throw new AppError('Esta orden no tiene una factura generada.', 404);
  }
  return factura;
}

async function obtenerPorId(id) {
  const factura = await facturaRepository.buscarPorId(id);
  if (!factura) {
    throw new AppError('Factura no encontrada.', 404);
  }
  return factura;
}

async function listar() {
  return facturaRepository.listar();
}

module.exports = { crear, obtenerPorOrdenId, obtenerPorId, listar };