const prisma = require('../config/prismaClient');

async function contarOrdenesPorEstado() {
  const resultado = await prisma.ordenTrabajo.groupBy({
    by: ['estado'],
    _count: { estado: true },
  });
  return resultado.map((r) => ({ estado: r.estado, cantidad: r._count.estado }));
}

async function contarClientes() {
  return prisma.cliente.count();
}

async function contarMotocicletas() {
  return prisma.motocicleta.count();
}

async function contarCitasProximas() {
  return prisma.cita.count({
    where: {
      fechaHora: { gte: new Date() },
      estado: { in: ['PROGRAMADA', 'CONFIRMADA'] },
    },
  });
}

async function sumarIngresosFacturados() {
  const resultado = await prisma.factura.aggregate({
    _sum: { total: true },
  });
  return resultado._sum.total || 0;
}

async function contarFacturas() {
  return prisma.factura.count();
}

module.exports = {
  contarOrdenesPorEstado,
  contarClientes,
  contarMotocicletas,
  contarCitasProximas,
  sumarIngresosFacturados,
  contarFacturas,
};