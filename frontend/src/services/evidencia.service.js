import api from './api';

export async function listarEvidencias(ordenId) {
  const { data } = await api.get(`/ordenes/${ordenId}/evidencias`);
  return data.data;
}

/**
 * Sube una fotografia a la orden.
 *
 * Va como formulario multiparte, no como JSON: una imagen en JSON habria que
 * convertirla a texto y creceria un tercio por el camino.
 *
 * No se fija la cabecera Content-Type a mano: el navegador tiene que ponerla
 * el mismo para incluir el separador del formulario. Escribirla rompe la
 * subida con un error que no dice nada.
 */
export async function subirEvidencia(ordenId, { imagen, momento, descripcion, alProgresar }) {
  const formulario = new FormData();
  formulario.append('imagen', imagen);
  if (momento) formulario.append('momento', momento);
  if (descripcion) formulario.append('descripcion', descripcion);

  const { data } = await api.post(`/ordenes/${ordenId}/evidencias`, formulario, {
    onUploadProgress: (evento) => {
      if (alProgresar && evento.total) {
        alProgresar(Math.round((evento.loaded * 100) / evento.total));
      }
    },
  });
  return data.data;
}

export async function eliminarEvidencia(ordenId, evidenciaId) {
  const { data } = await api.delete(`/ordenes/${ordenId}/evidencias/${evidenciaId}`);
  return data.mensaje;
}

export const MOMENTOS = [
  { valor: 'ANTES', etiqueta: 'Antes' },
  { valor: 'DURANTE', etiqueta: 'Durante' },
  { valor: 'DESPUES', etiqueta: 'Después' },
];
