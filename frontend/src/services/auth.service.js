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

// El servidor responde lo mismo exista o no la cuenta, para no dejar
// averiguar quien esta registrado. La pantalla muestra ese mismo texto.
export async function solicitarRecuperacion(email) {
  const { data } = await api.post('/auth/recuperar-password', { email });
  return data.mensaje;
}

// Se comprueba el enlace al abrir la pantalla, antes de pedir nada: asi nadie
// escribe una contrasena nueva para enterarse despues de que habia caducado.
export async function comprobarTokenRecuperacion(token) {
  const { data } = await api.get(`/auth/recuperar-password/${encodeURIComponent(token)}`);
  return data.mensaje;
}

export async function restablecerPassword({ token, password, confirmacion }) {
  const { data } = await api.post('/auth/restablecer-password', { token, password, confirmacion });
  return data.mensaje;
}

export async function verificarCorreo(token) {
  const { data } = await api.get(`/auth/verificar-correo/${encodeURIComponent(token)}`);
  return data.mensaje;
}
// --- Codigos de seis digitos -------------------------------------------

export async function solicitarCodigoActivacion(email) {
  const { data } = await api.post('/auth/activar/solicitar', { email });
  return data;
}

export async function confirmarActivacion({ email, codigo, password, confirmacion }) {
  const { data } = await api.post('/auth/activar/confirmar', {
    email,
    codigo,
    password,
    confirmacion,
  });
  return data;
}

export async function solicitarCodigoRecuperacion(email) {
  const { data } = await api.post('/auth/recuperar-codigo/solicitar', { email });
  return data;
}

export async function confirmarRecuperacion({ email, codigo, password, confirmacion }) {
  const { data } = await api.post('/auth/recuperar-codigo/confirmar', {
    email,
    codigo,
    password,
    confirmacion,
  });
  return data;
}
