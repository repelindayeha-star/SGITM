const prisma = require('../config/prismaClient');

async function crear({ repuestoId, tipo, cantidad, motivo }) {
  return prisma.movimientoInventario.create({
    data: { repuestoId, tipo, cantidad, motivo },
    include: { repuesto: true },
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

module.exports = { crear, listarPorRepuesto, listar };