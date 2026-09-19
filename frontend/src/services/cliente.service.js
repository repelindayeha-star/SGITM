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

// La recepcionista manda nombre y correo. NO manda contrasena: el servidor
// crea la cuenta sin una utilizable y le envia al cliente un codigo para que
// elija la suya. Devuelve tambien si el correo salio, para poder avisarlo.
export async function crearCliente({ nombre, email, telefono, direccion }) {
  const { data } = await api.post('/clientes', { nombre, email, telefono, direccion });
  return data;
}

export async function actualizarCliente(id, { telefono, direccion }) {
  const { data } = await api.put(`/clientes/${id}`, { telefono, direccion });
  return data.data;
}

export async function eliminarCliente(id) {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
}
