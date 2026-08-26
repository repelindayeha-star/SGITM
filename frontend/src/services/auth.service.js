import api from './api';

export async function login({ email, password, captchaToken }) {
  const { data } = await api.post('/auth/login', { email, password, captchaToken });
  return data.data; // { usuario, token }
}

export async function registrar({ nombre, email, password, rol, captchaToken }) {
  const { data } = await api.post('/auth/registro', { nombre, email, password, rol, captchaToken });
  return data.data;
}

export async function obtenerPerfil() {
  const { data } = await api.get('/auth/perfil');
  return data.data;
}