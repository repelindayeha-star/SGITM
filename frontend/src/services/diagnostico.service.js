import api from './api';

export async function crearDiagnostico({ ordenId, descripcion, manoObra }) {
  const { data } = await api.post('/diagnosticos', { ordenId, descripcion, manoObra });
  return data.data;
}

export async function obtenerPorOrden(ordenId) {
  const { data } = await api.get(`/diagnosticos/orden/${ordenId}`);
  return data.data;
}

export async function actualizarDiagnostico(id, datos) {
  const { data } = await api.put(`/diagnosticos/${id}`, datos);
  return data.data;
}

export async function calcularTotal(diagnosticoId) {
  const { data } = await api.get(`/diagnosticos/${diagnosticoId}/total`);
  return data.data;
}

export async function agregarItem({ diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario }) {
  const { data } = await api.post('/diagnosticos/items', {
    diagnosticoId,
    repuestoId: repuestoId || undefined,
    descripcion,
    cantidad,
    precioUnitario,
  });
  return data.data;
}

export async function eliminarItem(id) {
  const { data } = await api.delete(`/diagnosticos/items/${id}`);
  return data;
}
