const prisma = require('../config/prismaClient');

// Quien subio la foto se muestra solo dentro del taller. En el portal del
// cliente y en el seguimiento publico los nombres del personal no aparecen.
const conAutor = {
  usuario: { select: { id: true, nombre: true, rol: true } },
};

async function crear({ ordenId, url, urlMiniatura, identificadorPublico, momento, descripcion, usuarioId }) {
  return prisma.evidenciaOrden.create({
    data: { ordenId, url, urlMiniatura, identificadorPublico, momento, descripcion, usuarioId },
    include: conAutor,
  });
}

async function listarPorOrden(ordenId) {
  return prisma.evidenciaOrden.findMany({
    where: { ordenId },
    include: conAutor,
    orderBy: { createdAt: 'asc' },
  });
}

// Proyeccion para el cliente: la foto y cuando se tomo, nada mas.
async function listarPorOrdenParaCliente(ordenId) {
  return prisma.evidenciaOrden.findMany({
    where: { ordenId },
    select: {
      id: true,
      url: true,
      urlMiniatura: true,
      momento: true,
      descripcion: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

async function buscarPorId(id) {
  return prisma.evidenciaOrden.findUnique({ where: { id } });
}

async function contarPorOrden(ordenId) {
  return prisma.evidenciaOrden.count({ where: { ordenId } });
}

async function eliminar(id) {
  return prisma.evidenciaOrden.delete({ where: { id } });
}

module.exports = {
  crear,
  listarPorOrden,
  listarPorOrdenParaCliente,
  buscarPorId,
  contarPorOrden,
  eliminar,
};
