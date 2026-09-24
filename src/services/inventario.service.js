const repuestoRepository = require('../repositories/repuesto.repository');
const movimientoRepository = require('../repositories/movimientoInventario.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const diagnosticoRepository = require('../repositories/diagnostico.repository');
const AppError = require('../utils/AppError');

// Los repuestos salen del almacen cuando ya hay trabajo aprobado. Antes de
// eso la cotizacion es una propuesta: si el cliente no aprueba, el repuesto
// nunca se movio y restarlo del stock seria mentir sobre lo que hay.
const ESTADOS_QUE_CONSUMEN = ['APROBADA', 'EN_REPARACION', 'LISTA', 'ENTREGADA'];

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

/**
 * Descuenta del almacen los repuestos que se usaron en una orden.
 *
 * Quien repara es quien sabe que gasto, asi que lo hace el mecanico desde la
 * orden -- no recepcion de memoria al final del dia. Se toman las lineas de
 * la cotizacion que apuntan a un repuesto del inventario y que todavia no se
 * han descontado; las lineas de texto libre no son stock y se ignoran.
 *
 * Llamarlo dos veces no resta dos veces: las lineas ya descontadas quedan
 * marcadas con `descontadoEn` y se saltan. Si el mecanico agrega un repuesto
 * despues, volver a pulsar descuenta solo el nuevo.
 */
async function descontarRepuestosDeOrden(ordenId) {
  const orden = await ordenRepository.buscarPorId(ordenId);
  if (!orden) {
    throw new AppError('La orden de trabajo no existe.', 404);
  }

  if (!ESTADOS_QUE_CONSUMEN.includes(orden.estado)) {
    throw new AppError(
      `Los repuestos se descuentan cuando el cliente ya aprobo el trabajo. ` +
        `Esta orden esta en '${orden.estado}'.`,
      400
    );
  }

  const diagnostico = await diagnosticoRepository.buscarPorOrdenId(ordenId);
  if (!diagnostico) {
    throw new AppError('Esta orden no tiene un diagnostico con cotizacion.', 404);
  }

  const pendientes = diagnostico.itemsCotizacion.filter(
    (item) => item.repuestoId && !item.descontadoEn
  );

  if (pendientes.length === 0) {
    const yaSalieron = diagnostico.itemsCotizacion.some((item) => item.descontadoEn);
    throw new AppError(
      yaSalieron
        ? 'Los repuestos de esta orden ya se descontaron del inventario.'
        : 'La cotizacion no tiene repuestos del inventario para descontar.',
      400
    );
  }

  // Un mismo repuesto puede aparecer en dos lineas. Se suma antes de mirar
  // el stock: si no, dos lineas de 3 pasarian el control teniendo 4 en el
  // almacen y el stock terminaria en negativo.
  const totalPorRepuesto = new Map();
  for (const item of pendientes) {
    const acumulado = totalPorRepuesto.get(item.repuestoId) || 0;
    totalPorRepuesto.set(item.repuestoId, acumulado + item.cantidad);
  }

  const faltantes = [];
  for (const [repuestoId, cantidad] of totalPorRepuesto) {
    const repuesto = await repuestoRepository.buscarPorId(repuestoId);
    if (!repuesto) {
      throw new AppError('Uno de los repuestos de la cotizacion ya no existe.', 404);
    }
    if (repuesto.stock < cantidad) {
      faltantes.push(`${repuesto.nombre}: hay ${repuesto.stock}, se necesitan ${cantidad}`);
    }
  }

  if (faltantes.length > 0) {
    throw new AppError(`No hay stock suficiente. ${faltantes.join('; ')}.`, 400);
  }

  const lineas = pendientes.map((item) => ({
    itemId: item.id,
    repuestoId: item.repuestoId,
    cantidad: item.cantidad,
    motivo: `Consumo en la orden ${orden.codigo}`,
  }));

  const movimientos = await movimientoRepository.registrarConsumoDeOrden(ordenId, lineas);

  return {
    ordenId,
    codigo: orden.codigo,
    descontados: movimientos.length,
    movimientos,
  };
}

async function listarConsumoDeOrden(ordenId) {
  return movimientoRepository.listarPorOrden(ordenId);
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
  descontarRepuestosDeOrden,
  listarConsumoDeOrden,
  listarMovimientos,
  listarMovimientosPorRepuesto,
};