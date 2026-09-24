import api from './api';

export async function crearDiagnostico({ ordenId, descripcion, observaciones, manoObra }) {
  const { data } = await api.post('/diagnosticos', {
    ordenId,
    descripcion,
    // Faltaba en esta lista: la pantalla si mandaba las observaciones, pero
    // aqui se perdian antes de llegar al backend.
    observaciones,
    manoObra,
  });
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

// Cuando la linea es un repuesto del inventario, el nombre y el precio los
// decide el backend leyendo el repuesto: mandarlos desde aqui no cambia
// nada. Solo se envian para el item libre, que no tiene de donde sacarlos.
export async function agregarItem({ diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario }) {
  const cuerpo = repuestoId
    ? { diagnosticoId, repuestoId, cantidad }
    : { diagnosticoId, descripcion, cantidad, precioUnitario };
  const { data } = await api.post('/diagnosticos/items', cuerpo);
  return data.data;
}

export async function eliminarItem(id) {
  const { data } = await api.delete(`/diagnosticos/items/${id}`);
  return data;
}
