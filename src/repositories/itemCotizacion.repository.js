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

// Se trae el diagnostico para saber a que orden pertenece la linea: de eso
// dependen el control de dueno y el bloqueo por estado de la orden.
async function buscarPorId(id) {
  return prisma.itemCotizacion.findUnique({
    where: { id },
    include: { repuesto: true, diagnostico: { select: { id: true, ordenId: true } } },
  });
}

async function eliminar(id) {
  return prisma.itemCotizacion.delete({ where: { id } });
}

module.exports = { crear, listarPorDiagnostico, buscarPorId, eliminar };