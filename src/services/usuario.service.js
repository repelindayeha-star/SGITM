const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

const ROLES_TODOS = ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO', 'CLIENTE'];

// Desde este modulo solo se crean cuentas de PERSONAL.
//
// Un CLIENTE nace junto con su perfil (telefono, direccion, motos) desde el
// modulo de clientes. Crearlo aqui produciria un Usuario con rol CLIENTE sin
// perfil asociado: podria iniciar sesion, caeria en /mis-ordenes y recibiria
// un 404 sin salida. Es exactamente el caso roto que ya conocemos, asi que
// se cierra la puerta en vez de dejarla entreabierta.
const ROLES_STAFF = ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'];

async function listar({ rol, activo } = {}) {
  if (rol && !ROLES_TODOS.includes(rol)) {
    throw new AppError(`Rol inválido. Valores permitidos: ${ROLES_TODOS.join(', ')}`, 400);
  }
  return usuarioRepository.listar({ rol, activo });
}

async function obtenerPorId(id) {
  const usuario = await usuarioRepository.buscarPorIdSeguro(id);
  if (!usuario) {
    throw new AppError('Usuario no encontrado.', 404);
  }
  return usuario;
}

async function crear({ nombre, email, password, rol }) {
  if (!ROLES_STAFF.includes(rol)) {
    throw new AppError(
      `Desde aquí solo se crean cuentas de personal (${ROLES_STAFF.join(', ')}). ` +
        'Los clientes se registran desde el módulo de clientes, con su perfil.',
      400
    );
  }

  const existente = await usuarioRepository.buscarPorEmail(email);
  if (existente) {
    throw new AppError('Ya existe un usuario registrado con ese correo.', 409);
  }

  const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);
  const creado = await usuarioRepository.crear({
    nombre,
    email,
    password: passwordHasheada,
    rol,
  });

  const { password: _, ...sinPassword } = creado;
  return sinPassword;
}

async function actualizar(id, { nombre, rol }) {
  const usuario = await obtenerPorId(id);

  if (rol && !ROLES_STAFF.includes(rol)) {
    throw new AppError(`El rol debe ser uno de: ${ROLES_STAFF.join(', ')}`, 400);
  }

  // Degradar al ultimo administrador dejaria el sistema sin nadie que pueda
  // volver a nombrar uno: seria un candado sin llave.
  if (rol && usuario.rol === 'ADMINISTRADOR' && rol !== 'ADMINISTRADOR') {
    await verificarQueNoEsElUltimoAdministrador(usuario);
  }

  return usuarioRepository.actualizar(id, { nombre, rol });
}

async function cambiarActivo(id, activo, solicitanteId) {
  const usuario = await obtenerPorId(id);

  if (!activo && id === solicitanteId) {
    throw new AppError('No puedes desactivar tu propia cuenta.', 400);
  }

  if (!activo && usuario.rol === 'ADMINISTRADOR') {
    await verificarQueNoEsElUltimoAdministrador(usuario);
  }

  return usuarioRepository.cambiarActivo(id, activo);
}

async function verificarQueNoEsElUltimoAdministrador(usuario) {
  // Si ya estaba inactivo no cuenta como administrador disponible.
  if (!usuario.activo) return;

  const activos = await usuarioRepository.contarAdministradoresActivos();
  if (activos <= 1) {
    throw new AppError(
      'Es el único administrador activo del sistema. Nombra otro antes de desactivarlo o cambiarle el rol.',
      400
    );
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarActivo };
