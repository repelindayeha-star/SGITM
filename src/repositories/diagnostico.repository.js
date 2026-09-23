const prisma = require('../config/prismaClient');

async function crear({ ordenId, descripcion, observaciones, manoObra }) {
  return prisma.diagnostico.create({
    data: { ordenId, descripcion, observaciones, manoObra },
    include: { itemsCotizacion: true },
  });
}

async function buscarPorOrdenId(ordenId) {
  return prisma.diagnostico.findUnique({
    where: { ordenId },
    include: { itemsCotizacion: { include: { repuesto: true } } },
  });
}

async function buscarPorId(id) {
  return prisma.diagnostico.findUnique({
    where: { id },
    include: { itemsCotizacion: { include: { repuesto: true } } },
  });
}

async function actualizar(id, { descripcion, observaciones, manoObra }) {
  return prisma.diagnostico.update({ where: { id }, data: { descripcion, observaciones, manoObra } });
}

module.exports = { crear, buscarPorOrdenId, buscarPorId, actualizar };