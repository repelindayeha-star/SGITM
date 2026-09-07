import api from './api';

export async function listarUsuarios({ rol, activo } = {}) {
  const { data } = await api.get('/usuarios', { params: { rol, activo } });
  return data.data;
}

// Atajo usado al asignar un mecanico a una orden de trabajo.
// Solo los activos: asignarle una orden a alguien dado de baja no tiene sentido.
export async function listarMecanicos() {
  return listarUsuarios({ rol: 'MECANICO', activo: true });
}

export async function obtenerUsuario(id) {
  const { data } = await api.get(`/usuarios/${id}`);
  return data.data;
}

export async function crearUsuario({ nombre, email, password, rol }) {
  const { data } = await api.post('/usuarios', { nombre, email, password, rol });
  return data.data;
}

export async function actualizarUsuario(id, { nombre, rol }) {
  const { data } = await api.put(`/usuarios/${id}`, { nombre, rol });
  return data.data;
}

export async function cambiarActivo(id, activo) {
  const { data } = await api.patch(`/usuarios/${id}/activo`, { activo });
  return data.data;
}
