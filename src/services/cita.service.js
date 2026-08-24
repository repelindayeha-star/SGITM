const citaRepository = require('../repositories/cita.repository');
const clienteRepository = require('../repositories/cliente.repository');
const motocicletaRepository = require('../repositories/motocicleta.repository');
const AppError = require('../utils/AppError');

const ESTADOS_VALIDOS = ['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];

async function crear({ clienteId, motocicletaId, fechaHora, motivo }) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  if (!cliente) {
    throw new AppError('El cliente no existe.', 404);
  }

  const moto = await motocicletaRepository.buscarPorId(motocicletaId);
  if (!moto) {
    throw new AppError('La motocicleta no existe.', 404);
  }

  if (moto.clienteId !== clienteId) {
    throw new AppError('Esa motocicleta no pertenece al cliente indicado.', 400);
  }

  const fecha = new Date(fechaHora);
  if (fecha < new Date()) {
    throw new AppError('No se puede agendar una cita en una fecha pasada.', 400);
  }

  return citaRepository.crear({ clienteId, motocicletaId, fechaHora: fecha, motivo });
}

async function listar() {
  return citaRepository.listar();
}

async function obtenerPorId(id) {
  const cita = await citaRepository.buscarPorId(id);
  if (!cita) {
    throw new AppError('Cita no encontrada.', 404);
  }
  return cita;
}

async function listarPorCliente(clienteId) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  if (!cliente) {
    throw new AppError('El cliente no existe.', 404);
  }
  return citaRepository.listarPorCliente(clienteId);
}

async function cambiarEstado(id, estado) {
  await obtenerPorId(id);

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new AppError(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`, 400);
  }

  return citaRepository.actualizarEstado(id, estado);
}

async function actualizar(id, datos) {
  const cita = await obtenerPorId(id);

  if (cita.estado === 'CANCELADA' || cita.estado === 'COMPLETADA') {
    throw new AppError('No se puede modificar una cita cancelada o completada.', 400);
  }

  if (datos.fechaHora) {
    const fecha = new Date(datos.fechaHora);
    if (fecha < new Date()) {
      throw new AppError('No se puede reprogramar a una fecha pasada.', 400);
    }
    datos.fechaHora = fecha;
  }

  return citaRepository.actualizar(id, datos);
}

async function eliminar(id) {
  await obtenerPorId(id);
  return citaRepository.eliminar(id);
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  listarPorCliente,
  cambiarEstado,
  actualizar,
  eliminar,
};