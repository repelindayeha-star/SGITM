import api from './api';

export async function listarCitas() {
  const { data } = await api.get('/citas');
  return data.data;
}

export async function obtenerCita(id) {
  const { data } = await api.get(`/citas/${id}`);
  return data.data;
}

export async function listarPorCliente(clienteId) {
  const { data } = await api.get(`/citas/cliente/${clienteId}`);
  return data.data;
}

export async function crearCita({ clienteId, motocicletaId, fechaHora, motivo }) {
  const { data } = await api.post('/citas', { clienteId, motocicletaId, fechaHora, motivo });
  return data.data;
}

export async function cambiarEstadoCita(id, estado) {
  const { data } = await api.patch(`/citas/${id}/estado`, { estado });
  return data.data;
}

export async function actualizarCita(id, datos) {
  const { data } = await api.put(`/citas/${id}`, datos);
  return data.data;
}

export async function eliminarCita(id) {
  const { data } = await api.delete(`/citas/${id}`);
  return data;
}
