const prisma = require('../config/prismaClient');

async function crear({ clienteId, motocicletaId, fechaHora, motivo }) {
  return prisma.cita.create({
    data: { clienteId, motocicletaId, fechaHora, motivo },
    include: { cliente: { include: { usuario: true } }, motocicleta: true },
  });
}

async function listar() {
  return prisma.cita.findMany({
    include: { cliente: { include: { usuario: true } }, motocicleta: true },
    orderBy: { fechaHora: 'asc' },
  });
}

async function buscarPorId(id) {
  return prisma.cita.findUnique({
    where: { id },
    include: { cliente: { include: { usuario: true } }, motocicleta: true },
  });
}

async function listarPorCliente(clienteId) {
  return prisma.cita.findMany({
    where: { clienteId },
    include: { motocicleta: true },
    orderBy: { fechaHora: 'asc' },
  });
}

async function actualizarEstado(id, estado) {
  return prisma.cita.update({ where: { id }, data: { estado } });
}

async function actualizar(id, { fechaHora, motivo }) {
  return prisma.cita.update({ where: { id }, data: { fechaHora, motivo } });
}

async function eliminar(id) {
  return prisma.cita.delete({ where: { id } });
}

module.exports = {
  crear,
  listar,
  buscarPorId,
  listarPorCliente,
  actualizarEstado,
  actualizar,
  eliminar,
};