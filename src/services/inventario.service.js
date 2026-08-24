const repuestoRepository = require('../repositories/repuesto.repository');
const movimientoRepository = require('../repositories/movimientoInventario.repository');
const AppError = require('../utils/AppError');

async function crearRepuesto({ nombre, codigo, stock, stockMinimo, precio }) {
  const existente = await repuestoRepository.buscarPorCodigo(codigo);
  if (existente) {
    throw new AppError('Ya existe un repuesto con ese código.', 409);
  }

  return repuestoRepository.crear({
    nombre,
    codigo,
    stock: stock ?? 0,
    stockMinimo: stockMinimo ?? 5,
    precio,
  });
}

async function listarRepuestos() {
  return repuestoRepository.listar();
}

async function obtenerRepuestoPorId(id) {
  const repuesto = await repuestoRepository.buscarPorId(id);
  if (!repuesto) {
    throw new AppError('Repuesto no encontrado.', 404);
  }
  return repuesto;
}

async function listarStockBajo() {
  return repuestoRepository.listarConStockBajo();
}

async function actualizarRepuesto(id, datos) {
  await obtenerRepuestoPorId(id);
  return repuestoRepository.actualizar(id, datos);
}

async function eliminarRepuesto(id) {
  await obtenerRepuestoPorId(id);
  return repuestoRepository.eliminar(id);
}

/**
 * Registra un movimiento de inventario (ENTRADA o SALIDA) y ajusta
 * el stock del repuesto de forma atómica y consistente.
 */
async function registrarMovimiento({ repuestoId, tipo, cantidad, motivo }) {
  const repuesto = await obtenerRepuestoPorId(repuestoId);

  if (cantidad <= 0) {
    throw new AppError('La cantidad debe ser mayor a cero.', 400);
  }

  if (tipo === 'SALIDA' && repuesto.stock < cantidad) {
    throw new AppError(
      `Stock insuficiente. Disponible: ${repuesto.stock}, solicitado: ${cantidad}.`,
      400
    );
  }

  const ajuste = tipo === 'ENTRADA' ? cantidad : -cantidad;

  await repuestoRepository.ajustarStock(repuestoId, ajuste);
  return movimientoRepository.crear({ repuestoId, tipo, cantidad, motivo });
}

async function listarMovimientos() {
  return movimientoRepository.listar();
}

async function listarMovimientosPorRepuesto(repuestoId) {
  await obtenerRepuestoPorId(repuestoId);
  return movimientoRepository.listarPorRepuesto(repuestoId);
}

module.exports = {
  crearRepuesto,
  listarRepuestos,
  obtenerRepuestoPorId,
  listarStockBajo,
  actualizarRepuesto,
  eliminarRepuesto,
  registrarMovimiento,
  listarMovimientos,
  listarMovimientosPorRepuesto,
};