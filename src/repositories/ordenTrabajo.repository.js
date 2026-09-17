const prisma = require('../config/prismaClient');
const historialRepository = require('./historialOrden.repository');

const incluirRelaciones = {
  cliente: { include: { usuario: { select: { id: true, nombre: true, email: true } } } },
  motocicleta: true,
  mecanico: { select: { id: true, nombre: true, email: true } },
  diagnostico: { include: { itemsCotizacion: true } },
  factura: true,
  historialEstados: {
    include: { usuario: { select: { id: true, nombre: true, rol: true } } },
    orderBy: { createdAt: 'asc' },
  },
  evidencias: {
    include: { usuario: { select: { id: true, nombre: true, rol: true } } },
    orderBy: { createdAt: 'asc' },
  },
};

// Proyeccion para el seguimiento publico por codigo/QR.
//
// Esta ruta no exige autenticacion, asi que solo puede devolver lo minimo
// para responder "¿como va mi moto?". Antes usaba `incluirRelaciones`, es
// decir: con solo el codigo se obtenia el nombre y el correo del cliente, el
// correo del mecanico, la cotizacion item por item y el total de la factura.
//
// Fuera queda tambien la placa: identifica al vehiculo y, con el, al dueno.
// Del historial sale la fecha de cada paso, nunca quien lo hizo: los nombres
// del personal del taller son informacion interna.
const camposPublicos = {
  codigo: true,
  estado: true,
  descripcionProblema: true,
  fechaRecibido: true,
  fechaEntrega: true,
  motocicleta: { select: { marca: true, modelo: true, anio: true } },
  historialEstados: {
    select: { estadoNuevo: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
  // Las fotos SI salen aqui, y es deliberado: quien tiene el codigo es el
  // dueno de la moto, y ver que le hicieron es justo el problema que este
  // sistema existe para resolver. Lo que no sale es quien las tomo, igual
  // que en el historial: los nombres del personal son informacion interna.
  evidencias: {
    select: {
      id: true,
      url: true,
      urlMiniatura: true,
      momento: true,
      descripcion: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
};

async function crear({ codigo, clienteId, motocicletaId, descripcionProblema, usuarioId }) {
  return prisma.$transaction(async (tx) => {
    const orden = await tx.ordenTrabajo.create({
      data: { codigo, clienteId, motocicletaId, descripcionProblema },
    });

    // Primer asiento del historial. Sin el, la linea de tiempo del cliente
    // arrancaria sin fecha de recepcion y el primer paso quedaria mudo.
    await historialRepository.registrar(
      {
        ordenId: orden.id,
        estadoAnterior: null,
        estadoNuevo: orden.estado,
        usuarioId,
        nota: 'Orden recibida en el taller',
      },
      tx
    );

    return tx.ordenTrabajo.findUnique({ where: { id: orden.id }, include: incluirRelaciones });
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

async function buscarPorCodigoPublico(codigo) {
  return prisma.ordenTrabajo.findUnique({ where: { codigo }, select: camposPublicos });
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

/**
 * Cambia el estado y deja el asiento de auditoria en la misma transaccion.
 * El servicio ya valido que la transicion sea legal antes de llegar aqui.
 */
async function cambiarEstado(id, estado, { usuarioId, estadoAnterior, nota } = {}) {
  return prisma.$transaction(async (tx) => {
    const data = { estado };
    if (estado === 'ENTREGADA') {
      data.fechaEntrega = new Date();
    }

    await tx.ordenTrabajo.update({ where: { id }, data });

    await historialRepository.registrar(
      { ordenId: id, estadoAnterior, estadoNuevo: estado, usuarioId, nota },
      tx
    );

    return tx.ordenTrabajo.findUnique({ where: { id }, include: incluirRelaciones });
  });
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
  buscarPorCodigoPublico,
  listarPorCliente,
  listarPorMecanico,
  asignarMecanico,
  cambiarEstado,
  actualizar,
  eliminar,
};
