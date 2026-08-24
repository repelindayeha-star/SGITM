const prisma = require('../config/prismaClient');

async function crear({ ordenId, numero, subtotal, total, metodoPago }) {
  return prisma.factura.create({
    data: { ordenId, numero, subtotal, total, metodoPago },
    include: {
      orden: {
        include: {
          cliente: { include: { usuario: { select: { id: true, nombre: true, email: true } } } },
          motocicleta: true,
        },
      },
    },
  });
}

async function buscarPorOrdenId(ordenId) {
  return prisma.factura.findUnique({
    where: { ordenId },
    include: {
      orden: {
        include: {
          cliente: { include: { usuario: { select: { id: true, nombre: true, email: true } } } },
          motocicleta: true,
        },
      },
    },
  });
}

async function buscarPorId(id) {
  return prisma.factura.findUnique({
    where: { id },
    include: {
      orden: {
        include: {
          cliente: { include: { usuario: { select: { id: true, nombre: true, email: true } } } },
          motocicleta: true,
        },
      },
    },
  });
}

async function listar() {
  return prisma.factura.findMany({
    include: { orden: { include: { cliente: true, motocicleta: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { crear, buscarPorOrdenId, buscarPorId, listar };