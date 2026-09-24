const ordenRepository = require('../repositories/ordenTrabajo.repository');
const clienteRepository = require('../repositories/cliente.repository');
const motocicletaRepository = require('../repositories/motocicleta.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const notificacionService = require('./notificacion.service');
const AppError = require('../utils/AppError');

// Máquina de estados: qué transiciones son válidas desde cada estado.
const TRANSICIONES_VALIDAS = {
  RECIBIDA: ['EN_DIAGNOSTICO', 'CANCELADA'],
  EN_DIAGNOSTICO: ['EN_COTIZACION', 'CANCELADA'],
  EN_COTIZACION: ['APROBADA', 'CANCELADA'],
  APROBADA: ['EN_REPARACION', 'CANCELADA'],
  EN_REPARACION: ['LISTA', 'CANCELADA'],
  LISTA: ['ENTREGADA'],
  ENTREGADA: [],
  CANCELADA: [],
};

function generarCodigo() {
  const anio = new Date().getFullYear();
  const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OT-${anio}-${aleatorio}`;
}

// usuarioId = quien recibe la moto. Queda como primer asiento del historial.
async function crear({ clienteId, motocicletaId, descripcionProblema, usuarioId }) {
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

  const codigo = generarCodigo();

  return ordenRepository.crear({ codigo, clienteId, motocicletaId, descripcionProblema, usuarioId });
}

/**
 * El listado depende de quien pregunta.
 *
 * Un mecanico solo trabaja las ordenes que le asignaron, asi que su lista es
 * la suya. Antes el listado devolvia TODAS a cualquiera del taller: el
 * mecanico veia -- y podia abrir -- las de sus companeros.
 *
 * Administrador y recepcionista coordinan el taller y siguen viendo todo.
 */
async function listar(usuario) {
  if (usuario?.rol === 'MECANICO') {
    return ordenRepository.listarPorMecanico(usuario.id);
  }
  return ordenRepository.listar();
}

async function obtenerPorId(id) {
  const orden = await ordenRepository.buscarPorId(id);
  if (!orden) {
    throw new AppError('Orden de trabajo no encontrada.', 404);
  }
  return orden;
}

// Seguimiento publico por codigo/QR: devuelve la proyeccion reducida del
// repositorio (estado y datos de la moto), nunca el expediente completo.
async function obtenerPorCodigo(codigo) {
  const orden = await ordenRepository.buscarPorCodigoPublico(codigo);
  if (!orden) {
    throw new AppError('No se encontró ninguna orden con ese código.', 404);
  }
  return orden;
}

async function listarPorCliente(clienteId) {
  const cliente = await clienteRepository.buscarPorId(clienteId);
  if (!cliente) {
    throw new AppError('El cliente no existe.', 404);
  }
  return ordenRepository.listarPorCliente(clienteId);
}

async function listarPorMecanico(mecanicoId) {
  return ordenRepository.listarPorMecanico(mecanicoId);
}

async function asignarMecanico(id, mecanicoId) {
  const orden = await obtenerPorId(id);

  const mecanico = await usuarioRepository.buscarPorId(mecanicoId);
  if (!mecanico) {
    throw new AppError('El mecánico no existe.', 404);
  }
  if (mecanico.rol !== 'MECANICO') {
    throw new AppError('El usuario indicado no tiene el rol de mecánico.', 400);
  }

  if (orden.estado === 'ENTREGADA' || orden.estado === 'CANCELADA') {
    throw new AppError('No se puede asignar mecánico a una orden entregada o cancelada.', 400);
  }

  return ordenRepository.asignarMecanico(id, mecanicoId);
}

// usuarioId = quien ejecuta el cambio. Sin ese dato el historial no sirve
// como auditoria: registraria el que, pero no el quien.
async function cambiarEstado(id, nuevoEstado, usuarioId, nota) {
  const orden = await obtenerPorId(id);

  const permitidos = TRANSICIONES_VALIDAS[orden.estado] || [];
  if (!permitidos.includes(nuevoEstado)) {
    throw new AppError(
      `No se puede pasar de '${orden.estado}' a '${nuevoEstado}'. Transiciones válidas desde '${orden.estado}': ${
        permitidos.length ? permitidos.join(', ') : 'ninguna (estado final)'
      }.`,
      400
    );
  }

  const actualizada = await ordenRepository.cambiarEstado(id, nuevoEstado, {
    usuarioId,
    estadoAnterior: orden.estado,
    nota,
  });

  // El aviso al cliente va DESPUES de que el cambio quedo guardado, y no se
  // espera. Si el servidor de correo tarda cinco segundos, el recepcionista
  // no puede quedarse cinco segundos mirando una pantalla bloqueada; y si
  // falla, la orden igual avanzo.
  notificacionService.avisarCambioDeEstado(actualizada, orden.estado, nota);

  return actualizada;
}

async function actualizar(id, datos) {
  await obtenerPorId(id);
  return ordenRepository.actualizar(id, datos);
}

async function eliminar(id) {
  await obtenerPorId(id);
  return ordenRepository.eliminar(id);
}

module.exports = {
  // Se exporta para poder comprobarla con pruebas automatizadas sin tocar la
  // base de datos: la maquina de estados es la regla de negocio central y es
  // la que mas cara sale si alguien la rompe sin darse cuenta.
  TRANSICIONES_VALIDAS,
  crear,
  listar,
  obtenerPorId,
  obtenerPorCodigo,
  listarPorCliente,
  listarPorMecanico,
  asignarMecanico,
  cambiarEstado,
  actualizar,
  eliminar,
};