const prisma = require('../config/prismaClient');

async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function buscarPorId(id) {
  return prisma.usuario.findUnique({ where: { id } });
}

async function crear({ nombre, email, password, rol }) {
  return prisma.usuario.create({
    data: { nombre, email, password, rol },
  });
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  crear,
};