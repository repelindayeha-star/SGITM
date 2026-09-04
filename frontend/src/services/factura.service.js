import api from './api';

export async function listarFacturas() {
  const { data } = await api.get('/facturas');
  return data.data;
}

export async function obtenerFactura(id) {
  const { data } = await api.get(`/facturas/${id}`);
  return data.data;
}

export async function obtenerPorOrden(ordenId) {
  const { data } = await api.get(`/facturas/orden/${ordenId}`);
  return data.data;
}

export async function crearFactura({ ordenId, metodoPago }) {
  const { data } = await api.post('/facturas', { ordenId, metodoPago });
  return data.data;
}
