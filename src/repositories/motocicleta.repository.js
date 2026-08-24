const prisma = require('../config/prismaClient');

async function crear({ clienteId, placa, marca, modelo, anio, color }) {
  return prisma.motocicleta.create({
    data: { clienteId, placa: placa.toUpperCase(), marca, modelo, anio, color },
  });
}

async function listar() {
  return prisma.motocicleta.findMany({
    include: { cliente: { include: { usuario: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function buscarPorId(id) {
  return prisma.motocicleta.findUnique({
    where: { id },
    include: { cliente: { include: { usuario: true } } },
  });
}

async function buscarPorPlaca(placa) {
  return prisma.motocicleta.findUnique({
    where: { placa: placa.toUpperCase() },
  });
}

async function listarPorCliente(clienteId) {
  return prisma.motocicleta.findMany({ where: { clienteId } });
}

async function actualizar(id, { marca, modelo, anio, color }) {
  return prisma.motocicleta.update({
    where: { id },
    data: { marca, modelo, anio, color },
  });
}

async function eliminar(id) {
  return prisma.motocicleta.delete({ where: { id } });
}

module.exports = {
  crear,
  listar,
  buscarPorId,
  buscarPorPlaca,
  listarPorCliente,
  actualizar,
  eliminar,
};