const prisma = require('../config/prismaClient');

async function crear({ usuarioId, tokenHash, tipo, expiraEn }) {
  return prisma.tokenSeguridad.create({
    data: { usuarioId, tokenHash, tipo, expiraEn },
  });
}

async function buscarPorHash(tokenHash) {
  return prisma.tokenSeguridad.findUnique({
    where: { tokenHash },
    include: { usuario: true },
  });
}

async function marcarUsado(id) {
  return prisma.tokenSeguridad.update({
    where: { id },
    data: { usadoEn: new Date() },
  });
}

// Al pedir un enlace nuevo, los anteriores del mismo tipo dejan de servir.
// Si no se hiciera, pedir tres veces el enlace dejaria tres enlaces validos
// circulando por el correo a la vez.
async function invalidarAnteriores(usuarioId, tipo) {
  return prisma.tokenSeguridad.updateMany({
    where: { usuarioId, tipo, usadoEn: null },
    data: { usadoEn: new Date() },
  });
}

async function eliminarCaducados() {
  return prisma.tokenSeguridad.deleteMany({
    where: { expiraEn: { lt: new Date() } },
  });
}

module.exports = {
  crear,
  buscarPorHash,
  marcarUsado,
  invalidarAnteriores,
  eliminarCaducados,
};
