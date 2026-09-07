const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');
const { generarToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

/**
 * Registro publico. Crea SIEMPRE un usuario con rol CLIENTE.
 *
 * El rol ya no se recibe como parametro: se fija aqui dentro. Aunque el
 * validador tambien lo rechaza, esta funcion no depende de eso — si manana
 * alguien la llama desde otro sitio, sigue siendo imposible escalar el rol.
 */
async function registrar({ nombre, email, password }) {
  const existente = await usuarioRepository.buscarPorEmail(email);
  if (existente) {
    throw new AppError('Ya existe un usuario registrado con ese correo.', 409);
  }

  const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);

  const nuevoUsuario = await usuarioRepository.crear({
    nombre,
    email,
    password: passwordHasheada,
    rol: 'CLIENTE',
  });

  const { password: _, ...usuarioSinPassword } = nuevoUsuario;
  return usuarioSinPassword;
}

async function login({ email, password }) {
  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario) {
    throw new AppError('Credenciales inválidas.', 401);
  }

  if (!usuario.activo) {
    throw new AppError('Este usuario está inactivo. Contacta al administrador.', 403);
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new AppError('Credenciales inválidas.', 401);
  }

  const token = generarToken({
    id: usuario.id,
    rol: usuario.rol,
    nombre: usuario.nombre,
  });

  const { password: _, ...usuarioSinPassword } = usuario;

  return { usuario: usuarioSinPassword, token };
}

module.exports = { registrar, login };
