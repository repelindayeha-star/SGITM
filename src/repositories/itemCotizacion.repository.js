    const prisma = require('../config/prismaClient');

async function crear({ diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario }) {
  return prisma.itemCotizacion.create({
    data: { diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario },
    include: { repuesto: true },
  });
}

async function listarPorDiagnostico(diagnosticoId) {
  return prisma.itemCotizacion.findMany({
    where: { diagnosticoId },
    include: { repuesto: true },
  });
}

async function buscarPorId(id) {
  return prisma.itemCotizacion.findUnique({ where: { id }, include: { repuesto: true } });
}

async function eliminar(id) {
  return prisma.itemCotizacion.delete({ where: { id } });
}

module.exports = { crear, listarPorDiagnostico, buscarPorId, eliminar };