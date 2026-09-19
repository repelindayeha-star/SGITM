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


// Busca el codigo vivo de un usuario.
//
// Hace falta buscar por usuario y no por huella porque cuando el codigo esta
// MAL la huella no coincide con ninguna fila, y aun asi hay que encontrar el
// registro para sumarle el intento fallido. Sin esto, equivocarse no costaria
// nada y el contador de intentos no serviria para nada.
async function buscarActivo(usuarioId, tipo) {
  return prisma.tokenSeguridad.findFirst({
    where: { usuarioId, tipo, usadoEn: null },
    orderBy: { createdAt: 'desc' },
    include: { usuario: true },
  });
}

// Suma un intento fallido. Devuelve la fila actualizada para que el servicio
// sepa cuantos quedan sin tener que volver a consultar.
async function sumarIntento(id) {
  return prisma.tokenSeguridad.update({
    where: { id },
    data: { intentos: { increment: 1 } },
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
  buscarActivo,
  sumarIntento,
  eliminarCaducados,
};
