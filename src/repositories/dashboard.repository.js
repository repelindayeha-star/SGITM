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

/* ------------------------------------------------------------------ *
 * Vista de negocio para el administrador.
 *
 * El administrador es el dueño del taller: no le sirve saber cuántas
 * órdenes hay abiertas, le sirve saber cuánto entró, de dónde salió y
 * qué produjo cada mecánico.
 *
 * Se leen las facturas con su orden, su diagnóstico y sus ítems, y se
 * agrega en memoria. Es a propósito: son volúmenes de un taller, no de
 * un banco, y así el cálculo queda a la vista y auditable en un solo
 * sitio en vez de repartido en SQL.
 * ------------------------------------------------------------------ */

function inicioDelMes() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
}

async function obtenerFacturasConDetalle() {
  return prisma.factura.findMany({
    include: {
      orden: {
        include: {
          mecanico: { select: { id: true, nombre: true } },
          diagnostico: { include: { itemsCotizacion: true } },
        },
      },
    },
  });
}

async function resumirNegocio() {
  const facturas = await obtenerFacturasConDetalle();
  const desde = inicioDelMes();

  let ingresosTotales = 0;
  let ingresosDelMes = 0;
  let totalManoObra = 0;
  let totalRepuestos = 0;
  const porMecanico = new Map();

  for (const factura of facturas) {
    const total = Number(factura.total);
    ingresosTotales += total;
    if (factura.createdAt >= desde) ingresosDelMes += total;

    const diagnostico = factura.orden?.diagnostico;
    if (diagnostico) {
      totalManoObra += Number(diagnostico.manoObra);
      for (const item of diagnostico.itemsCotizacion || []) {
        totalRepuestos += Number(item.precioUnitario) * Number(item.cantidad);
      }
    }

    // Una orden sin mecánico asignado existe: no se inventa un responsable,
    // se agrupa aparte para que los totales sigan cuadrando.
    const mecanico = factura.orden?.mecanico;
    const clave = mecanico?.id || 'sin-asignar';
    const nombre = mecanico?.nombre || 'Sin mecánico asignado';
    const acumulado = porMecanico.get(clave) || { nombre, ordenes: 0, ingresos: 0 };
    acumulado.ordenes += 1;
    acumulado.ingresos += total;
    porMecanico.set(clave, acumulado);
  }

  const cantidadFacturas = facturas.length;

  return {
    ingresosTotales,
    ingresosDelMes,
    cantidadFacturas,
    ticketPromedio: cantidadFacturas > 0 ? ingresosTotales / cantidadFacturas : 0,
    composicion: { manoObra: totalManoObra, repuestos: totalRepuestos },
    porMecanico: [...porMecanico.values()].sort((a, b) => b.ingresos - a.ingresos),
  };
}

module.exports = {
  contarOrdenesPorEstado,
  contarClientes,
  contarMotocicletas,
  contarCitasProximas,
  sumarIngresosFacturados,
  contarFacturas,
  resumirNegocio,
};