import api from './api';

export async function listarOrdenes() {
  const { data } = await api.get('/ordenes');
  return data.data;
}

export async function obtenerOrden(id) {
  const { data } = await api.get(`/ordenes/${id}`);
  return data.data;
}

export async function obtenerPorCodigo(codigo) {
  const { data } = await api.get(`/ordenes/seguimiento/${codigo}`);
  return data.data;
}

export async function listarPorCliente(clienteId) {
  const { data } = await api.get(`/ordenes/cliente/${clienteId}`);
  return data.data;
}

export async function listarPorMecanico(mecanicoId) {
  const { data } = await api.get(`/ordenes/mecanico/${mecanicoId}`);
  return data.data;
}

export async function crearOrden({ clienteId, motocicletaId, descripcionProblema }) {
  const { data } = await api.post('/ordenes', { clienteId, motocicletaId, descripcionProblema });
  return data.data;
}

export async function asignarMecanico(id, mecanicoId) {
  const { data } = await api.patch(`/ordenes/${id}/mecanico`, { mecanicoId });
  return data.data;
}

export async function cambiarEstadoOrden(id, estado) {
  const { data } = await api.patch(`/ordenes/${id}/estado`, { estado });
  return data.data;
}

export async function actualizarOrden(id, datos) {
  const { data } = await api.put(`/ordenes/${id}`, datos);
  return data.data;
}

export async function eliminarOrden(id) {
  const { data } = await api.delete(`/ordenes/${id}`);
  return data;
}
