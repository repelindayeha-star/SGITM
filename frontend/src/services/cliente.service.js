import api from './api';

export async function listarClientes() {
  const { data } = await api.get('/clientes');
  return data.data;
}

export async function obtenerMiPerfil() {
  const { data } = await api.get('/clientes/me');
  return data.data;
}

export async function obtenerCliente(id) {
  const { data } = await api.get(`/clientes/${id}`);
  return data.data;
}

export async function crearCliente({ usuarioId, telefono, direccion }) {
  const { data } = await api.post('/clientes', { usuarioId, telefono, direccion });
  return data.data;
}

export async function actualizarCliente(id, { telefono, direccion }) {
  const { data } = await api.put(`/clientes/${id}`, { telefono, direccion });
  return data.data;
}

export async function eliminarCliente(id) {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
}
