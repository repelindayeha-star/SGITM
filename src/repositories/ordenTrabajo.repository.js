const prisma = require('../config/prismaClient');

const incluirRelaciones = {
  cliente: { include: { usuario: { select: { id: true, nombre: true, email: true } } } },
  motocicleta: true,
  mecanico: { select: { id: true, nombre: true, email: true } },
  diagnostico: { include: { itemsCotizacion: true } },
  factura: true,
};

async function crear({ codigo, clienteId, motocicletaId, descripcionProblema }) {
  return prisma.ordenTrabajo.create({
    data: { codigo, clienteId, motocicletaId, descripcionProblema },
    include: incluirRelaciones,
  });
}

async function listar() {
  return prisma.ordenTrabajo.findMany({
    include: incluirRelaciones,
    orderBy: { createdAt: 'desc' },
  });
}

async function buscarPorId(id) {
  return prisma.ordenTrabajo.findUnique({ where: { id }, include: incluirRelaciones });
}

async function buscarPorCodigo(codigo) {
  return prisma.ordenTrabajo.findUnique({ where: { codigo }, include: incluirRelaciones });
}

async function listarPorCliente(clienteId) {
  return prisma.ordenTrabajo.findMany({
    where: { clienteId },
    include: incluirRelaciones,
    orderBy: { createdAt: 'desc' },
  });
}

async function listarPorMecanico(mecanicoId) {
  return prisma.ordenTrabajo.findMany({
    where: { mecanicoId },
    include: incluirRelaciones,
    orderBy: { createdAt: 'desc' },
  });
}

async function asignarMecanico(id, mecanicoId) {
  return prisma.ordenTrabajo.update({
    where: { id },
    data: { mecanicoId },
    include: incluirRelaciones,
  });
}

async function cambiarEstado(id, estado) {
  const data = { estado };
  if (estado === 'ENTREGADA') {
    data.fechaEntrega = new Date();
  }
  return prisma.ordenTrabajo.update({ where: { id }, data, include: incluirRelaciones });
}

async function actualizar(id, { observaciones }) {
  return prisma.ordenTrabajo.update({
    where: { id },
    data: { observaciones },
    include: incluirRelaciones,
  });
}

async function eliminar(id) {
  return prisma.ordenTrabajo.delete({ where: { id } });
}

module.exports = {
  crear,
  listar,
  buscarPorId,
  buscarPorCodigo,
  listarPorCliente,
  listarPorMecanico,
  asignarMecanico,
  cambiarEstado,
  actualizar,
  eliminar,
};