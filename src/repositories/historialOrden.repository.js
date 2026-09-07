const prisma = require('../config/prismaClient');

const incluirAutor = {
  usuario: { select: { id: true, nombre: true, rol: true } },
};

/**
 * Registra un asiento del historial.
 *
 * Acepta un cliente de transaccion como segundo argumento: el cambio de estado
 * y su registro tienen que ocurrir juntos o no ocurrir. Si el historial se
 * escribiera aparte, un fallo a mitad de camino dejaria una orden movida sin
 * rastro de quien la movio, que es justo lo que la auditoria debe impedir.
 */
async function registrar({ ordenId, estadoAnterior, estadoNuevo, usuarioId, nota }, tx = prisma) {
  return tx.historialEstadoOrden.create({
    data: {
      ordenId,
      estadoAnterior: estadoAnterior ?? null,
      estadoNuevo,
      usuarioId: usuarioId ?? null,
      nota: nota ?? null,
    },
  });
}

async function listarPorOrden(ordenId) {
  return prisma.historialEstadoOrden.findMany({
    where: { ordenId },
    include: incluirAutor,
    orderBy: { createdAt: 'asc' },
  });
}

module.exports = { registrar, listarPorOrden };
