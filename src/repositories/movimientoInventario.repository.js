const prisma = require('../config/prismaClient');

async function crear({ repuestoId, tipo, cantidad, motivo, ordenId }) {
  return prisma.movimientoInventario.create({
    data: { repuestoId, tipo, cantidad, motivo, ordenId },
    include: { repuesto: true },
  });
}

/**
 * Descuenta del almacen los repuestos que se usaron en una orden.
 *
 * Va en una sola transaccion a proposito. Son tres escrituras por linea
 * (bajar el stock, dejar el movimiento, marcar la linea como descontada) y
 * si una falla a mitad de camino el almacen queda mintiendo: stock rebajado
 * sin movimiento que lo explique, o lineas marcadas que nunca salieron.
 * O salen todas, o no sale ninguna.
 *
 * `lineas` = [{ itemId, repuestoId, cantidad, motivo }]
 */
async function registrarConsumoDeOrden(ordenId, lineas) {
  const ahora = new Date();

  return prisma.$transaction(async (tx) => {
    const movimientos = [];

    for (const linea of lineas) {
      // decrement + la condicion de stock suficiente ya validada arriba.
      await tx.repuesto.update({
        where: { id: linea.repuestoId },
        data: { stock: { decrement: linea.cantidad } },
      });

      const movimiento = await tx.movimientoInventario.create({
        data: {
          repuestoId: linea.repuestoId,
          tipo: 'SALIDA',
          cantidad: linea.cantidad,
          motivo: linea.motivo,
          ordenId,
        },
        include: { repuesto: true },
      });
      movimientos.push(movimiento);

      await tx.itemCotizacion.update({
        where: { id: linea.itemId },
        data: { descontadoEn: ahora },
      });
    }

    return movimientos;
  });
}

async function listarPorOrden(ordenId) {
  return prisma.movimientoInventario.findMany({
    where: { ordenId },
    include: { repuesto: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function listarPorRepuesto(repuestoId) {
  return prisma.movimientoInventario.findMany({
    where: { repuestoId },
    orderBy: { createdAt: 'desc' },
  });
}

async function listar() {
  return prisma.movimientoInventario.findMany({
    include: { repuesto: true },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { crear, registrarConsumoDeOrden, listarPorOrden, listarPorRepuesto, listar };