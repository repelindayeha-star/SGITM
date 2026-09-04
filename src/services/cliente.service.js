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


async function obtenerPorUsuarioId(usuarioId) {
  const cliente = await clienteRepository.buscarPorUsuarioId(usuarioId);
  if (!cliente) {
    throw new AppError('No se encontro un perfil de cliente para este usuario.', 404);
  }
  return cliente;
}

async function actualizar(id, datos) {
  await obtenerPorId(id); 
  return clienteRepository.actualizar(id, datos);
}

module.exports = { crear, listar, obtenerPorId, obtenerPorUsuarioId, actualizar };