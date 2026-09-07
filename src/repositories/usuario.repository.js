const prisma = require('../config/prismaClient');

// Proyeccion sin el hash de la contrasena. Todo lo que sale de este
// repositorio hacia el modulo de usuarios pasa por aqui; la unica excepcion
// es buscarPorEmail, que el login necesita completo para poder comparar.
const camposSeguros = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
};

async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function buscarPorId(id) {
  return prisma.usuario.findUnique({ where: { id } });
}

async function buscarPorIdSeguro(id) {
  return prisma.usuario.findUnique({ where: { id }, select: camposSeguros });
}

async function listar({ rol, activo } = {}) {
  return prisma.usuario.findMany({
    where: {
      ...(rol ? { rol } : {}),
      ...(activo === undefined ? {} : { activo }),
    },
    select: camposSeguros,
    orderBy: [{ rol: 'asc' }, { nombre: 'asc' }],
  });
}

async function crear({ nombre, email, password, rol }) {
  return prisma.usuario.create({
    data: { nombre, email, password, rol },
  });
}

async function actualizar(id, { nombre, rol }) {
  return prisma.usuario.update({
    where: { id },
    data: {
      ...(nombre === undefined ? {} : { nombre }),
      ...(rol === undefined ? {} : { rol }),
    },
    select: camposSeguros,
  });
}

async function cambiarActivo(id, activo) {
  return prisma.usuario.update({
    where: { id },
    data: { activo },
    select: camposSeguros,
  });
}

async function contarAdministradoresActivos() {
  return prisma.usuario.count({ where: { rol: 'ADMINISTRADOR', activo: true } });
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  buscarPorIdSeguro,
  listar,
  crear,
  actualizar,
  cambiarActivo,
  contarAdministradoresActivos,
};
