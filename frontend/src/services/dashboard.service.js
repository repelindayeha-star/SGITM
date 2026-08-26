import api from './api';

export async function obtenerResumen() {
  const { data } = await api.get('/dashboard/resumen');
  return data.data;
}
