const prisma = require('../config/prismaClient');

const usuarioSeguro = {
  select: {
    id: true,
    nombre: true,
    email: true,
    rol: true,
    activo: true,
  },
};

async function crear({ usuarioId, telefono, direccion }) {
  return prisma.cliente.create({
    data: { usuarioId, telefono, direccion },
    include: { usuario: usuarioSeguro },
  });
}

async function listar() {
  return prisma.cliente.findMany({
    include: { usuario: usuarioSeguro, motocicletas: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function buscarPorId(id) {
  return prisma.cliente.findUnique({
    where: { id },
    include: { usuario: usuarioSeguro, motocicletas: true },
  });
}

async function buscarPorUsuarioId(usuarioId) {
  return prisma.cliente.findUnique({
    where: { usuarioId },
    include: { usuario: usuarioSeguro, motocicletas: true },
  });
}

async function actualizar(id, { telefono, direccion }) {
  return prisma.cliente.update({
    where: { id },
    data: { telefono, direccion },
  });
}

async function eliminar(id) {
  return prisma.cliente.delete({ where: { id } });
}

module.exports = {
  crear,
  listar,
  buscarPorId,
  buscarPorUsuarioId,
  actualizar,
  eliminar,
};