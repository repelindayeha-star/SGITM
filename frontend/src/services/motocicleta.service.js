import api from './api';

export async function listarMotocicletas() {
  const { data } = await api.get('/motocicletas');
  return data.data;
}

export async function obtenerMotocicleta(id) {
  const { data } = await api.get(`/motocicletas/${id}`);
  return data.data;
}

export async function listarPorCliente(clienteId) {
  const { data } = await api.get(`/motocicletas/cliente/${clienteId}`);
  return data.data;
}

export async function crearMotocicleta({ clienteId, placa, marca, modelo, anio, color }) {
  const { data } = await api.post('/motocicletas', { clienteId, placa, marca, modelo, anio, color });
  return data.data;
}

export async function actualizarMotocicleta(id, datos) {
  const { data } = await api.put(`/motocicletas/${id}`, datos);
  return data.data;
}

export async function eliminarMotocicleta(id) {
  const { data } = await api.delete(`/motocicletas/${id}`);
  return data;
}