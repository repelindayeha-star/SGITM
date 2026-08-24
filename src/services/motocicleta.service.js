const motocicletaRepository = require('../repositories/motocicleta.repository');
const clienteRepository = require('../repositories/cliente.repository');
const AppError = require('../utils/AppError');

async function crear({ clienteId, placa, marca, modelo, anio, color }) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  if (!cliente) {
    throw new AppError('El cliente asociado no existe.', 404);
  }

  const placaExistente = await motocicletaRepository.buscarPorPlaca(placa);
  if (placaExistente) {
    throw new AppError('Ya existe una motocicleta registrada con esa placa.', 409);
  }

  return motocicletaRepository.crear({ clienteId, placa, marca, modelo, anio, color });
}

async function listar() {
  return motocicletaRepository.listar();
}

async function obtenerPorId(id) {
  const moto = await motocicletaRepository.buscarPorId(id);
  if (!moto) {
    throw new AppError('Motocicleta no encontrada.', 404);
  }
  return moto;
}

async function listarPorCliente(clienteId) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  if (!cliente) {
    throw new AppError('El cliente no existe.', 404);
  }
  return motocicletaRepository.listarPorCliente(clienteId);
}

async function actualizar(id, datos) {
  await obtenerPorId(id);
  return motocicletaRepository.actualizar(id, datos);
}

async function eliminar(id) {
  await obtenerPorId(id);
  return motocicletaRepository.eliminar(id);
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  listarPorCliente,
  actualizar,
  eliminar,
};