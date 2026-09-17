const evidenciaRepository = require('../repositories/evidencia.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const almacenamiento = require('./almacenamiento.service');
const AppError = require('../utils/AppError');

// Un tope por orden. No es una limitacion tecnica: es que cuarenta fotos de
// la misma moto no documentan mejor el trabajo, solo lo entierran, y el
// cliente que las abre desde el celular paga los datos.
const MAXIMO_POR_ORDEN = 12;

const ESTADOS_CERRADOS = ['ENTREGADA', 'CANCELADA'];

async function listar(ordenId) {
  await asegurarQueExiste(ordenId);
  return evidenciaRepository.listarPorOrden(ordenId);
}

async function agregar({ ordenId, archivo, momento, descripcion, usuarioId }) {
  const orden = await asegurarQueExiste(ordenId);

  // Una orden entregada o cancelada ya no se toca. Si se pudieran agregar
  // fotos despues, la evidencia dejaria de ser un registro de lo que paso y
  // pasaria a ser algo que se puede componer mas tarde.
  if (ESTADOS_CERRADOS.includes(orden.estado)) {
    throw new AppError(
      `La orden esta ${orden.estado.toLowerCase()} y ya no admite evidencias nuevas.`,
      400
    );
  }

  const cuantas = await evidenciaRepository.contarPorOrden(ordenId);
  if (cuantas >= MAXIMO_POR_ORDEN) {
    throw new AppError(`Una orden no puede tener mas de ${MAXIMO_POR_ORDEN} fotografias.`, 400);
  }

  const problema = almacenamiento.validarImagen(archivo);
  if (problema) throw new AppError(problema, 400);

  let subida;
  try {
    subida = await almacenamiento.subirImagen(archivo);
  } catch (error) {
    throw new AppError(`No se pudo guardar la imagen: ${error.message}`, 502);
  }

  // Si la fila fallara despues de subir el archivo, quedaria una imagen
  // pagando espacio que nadie puede ver ni borrar. Se limpia.
  try {
    return await evidenciaRepository.crear({
      ordenId,
      url: subida.url,
      urlMiniatura: subida.urlMiniatura,
      identificadorPublico: subida.identificadorPublico,
      momento: momento || 'DURANTE',
      descripcion: descripcion?.trim() || null,
      usuarioId,
    });
  } catch (error) {
    await almacenamiento.borrarImagen(subida);
    throw error;
  }
}

async function eliminar(id) {
  const evidencia = await evidenciaRepository.buscarPorId(id);
  if (!evidencia) throw new AppError('Esa evidencia no existe.', 404);

  const orden = await ordenRepository.buscarPorId(evidencia.ordenId);
  if (orden && ESTADOS_CERRADOS.includes(orden.estado)) {
    throw new AppError('No se pueden borrar evidencias de una orden ya cerrada.', 400);
  }

  // Primero el archivo, despues la fila: al reves, un fallo al borrar el
  // archivo dejaria la fila apuntando a una imagen que ya no existe.
  await almacenamiento.borrarImagen(evidencia);
  await evidenciaRepository.eliminar(id);
  return { mensaje: 'Evidencia eliminada.' };
}

async function asegurarQueExiste(ordenId) {
  const orden = await ordenRepository.buscarPorId(ordenId);
  if (!orden) throw new AppError('Orden de trabajo no encontrada.', 404);
  return orden;
}

module.exports = { listar, agregar, eliminar, MAXIMO_POR_ORDEN };
