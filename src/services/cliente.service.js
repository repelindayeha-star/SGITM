const clienteRepository = require('../repositories/cliente.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const AppError = require('../utils/AppError');

async function crear({ usuarioId, telefono, direccion }) {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new AppError('El usuario asociado no existe.', 404);
  }

  const clienteExistente = await clienteRepository.buscarPorUsuarioId(usuarioId);
  if (clienteExistente) {
    throw new AppError('Este usuario ya tiene un perfil de cliente.', 409);
  }

  return clienteRepository.crear({ usuarioId, telefono, direccion });
}

async function listar() {
  return clienteRepository.listar();
}

async function obtenerPorId(id) {
  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) {
    throw new AppError('Cliente no encontrado.', 404);
  }
  return cliente;
}

async function actualizar(id, datos) {
  await obtenerPorId(id); // valida que exista, lanza 404 si no
  return clienteRepository.actualizar(id, datos);
}

async function eliminar(id) {
  await obtenerPorId(id);
  return clienteRepository.eliminar(id);
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };