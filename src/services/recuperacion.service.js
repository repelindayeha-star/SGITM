const bcrypt = require('bcrypt');
const prisma = require('../config/prismaClient');
const usuarioRepository = require('../repositories/usuario.repository');
const tokenRepository = require('../repositories/tokenSeguridad.repository');
const correoService = require('./correo.service');
const plantillas = require('../plantillas/correo');
const { generarToken, hashear, calcularExpiracion, CADUCIDAD_MINUTOS } = require('../utils/tokenSeguridad');
const AppError = require('../utils/AppError');
const env = require('../config/env');

const SALT_ROUNDS = 10;

/**
 * Paso 1: alguien dice "olvide mi contrasena".
 *
 * Responde SIEMPRE lo mismo, exista el correo o no. Si contestara "ese correo
 * no esta registrado" cualquiera podria averiguar, probando direcciones, quien
 * tiene cuenta en el taller. Se llama enumeracion de usuarios y es una fuga de
 * informacion, aunque parezca un detalle de cortesia.
 */
async function solicitarRecuperacion(email) {
  const usuario = await usuarioRepository.buscarPorEmail(email);

  if (usuario && usuario.activo) {
    await tokenRepository.invalidarAnteriores(usuario.id, 'RECUPERACION_PASSWORD');

    const { token, tokenHash } = generarToken();
    await tokenRepository.crear({
      usuarioId: usuario.id,
      tokenHash,
      tipo: 'RECUPERACION_PASSWORD',
      expiraEn: calcularExpiracion('RECUPERACION_PASSWORD'),
    });

    const enlace = `${env.urlFrontend}/restablecer-password?token=${token}`;
    const mensaje = plantillas.recuperacionPassword({
      nombre: usuario.nombre,
      enlace,
      minutos: CADUCIDAD_MINUTOS.RECUPERACION_PASSWORD,
    });

    await correoService.enviar({ para: usuario.email, ...mensaje });
  }

  return {
    mensaje:
      'Si ese correo corresponde a una cuenta activa, te enviamos un enlace para restablecer la contrasena.',
  };
}

// Comprueba el token sin gastarlo. La pantalla lo usa al abrirse, para no
// dejar que la persona escriba una contrasena nueva y solo entonces enterarse
// de que el enlace habia caducado.
async function validarToken(token, tipoEsperado) {
  const registro = await tokenRepository.buscarPorHash(hashear(token));

  if (!registro || registro.tipo !== tipoEsperado) {
    throw new AppError('El enlace no es valido.', 400);
  }
  if (registro.usadoEn) {
    throw new AppError('Este enlace ya se uso. Solicita uno nuevo.', 400);
  }
  if (registro.expiraEn < new Date()) {
    throw new AppError('El enlace caduco. Solicita uno nuevo.', 400);
  }
  if (!registro.usuario.activo) {
    throw new AppError('Esta cuenta esta inactiva. Contacta al administrador.', 403);
  }

  return registro;
}

/**
 * Paso 2: la persona abre el enlace y escribe la contrasena nueva.
 *
 * Las tres escrituras van en una sola transaccion: guardar la contrasena,
 * mover la fecha de cambio y marcar el token como gastado. Si se hicieran
 * sueltas y fallara la de en medio, el token quedaria disponible para usarse
 * otra vez sobre una cuenta que ya cambio de contrasena.
 */
async function restablecerPassword({ token, password }) {
  const registro = await validarToken(token, 'RECUPERACION_PASSWORD');
  const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);
  const ahora = new Date();

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { password: passwordHasheada, passwordCambiadaEn: ahora },
    }),
    prisma.tokenSeguridad.update({
      where: { id: registro.id },
      data: { usadoEn: ahora },
    }),
    // Cualquier otro enlace de recuperacion pendiente deja de servir.
    prisma.tokenSeguridad.updateMany({
      where: { usuarioId: registro.usuarioId, tipo: 'RECUPERACION_PASSWORD', usadoEn: null },
      data: { usadoEn: ahora },
    }),
  ]);

  return {
    mensaje: 'Contrasena actualizada. Las sesiones abiertas se cerraron; entra de nuevo.',
  };
}

// Enviar el enlace de confirmacion del correo.
async function enviarVerificacionEmail(usuario) {
  await tokenRepository.invalidarAnteriores(usuario.id, 'VERIFICACION_EMAIL');

  const { token, tokenHash } = generarToken();
  await tokenRepository.crear({
    usuarioId: usuario.id,
    tokenHash,
    tipo: 'VERIFICACION_EMAIL',
    expiraEn: calcularExpiracion('VERIFICACION_EMAIL'),
  });

  const enlace = `${env.urlFrontend}/verificar-correo?token=${token}`;
  const mensaje = plantillas.verificacionEmail({ nombre: usuario.nombre, enlace });

  return correoService.enviar({ para: usuario.email, ...mensaje });
}

async function verificarEmail(token) {
  const registro = await validarToken(token, 'VERIFICACION_EMAIL');
  const ahora = new Date();

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { emailVerificado: true },
    }),
    prisma.tokenSeguridad.update({
      where: { id: registro.id },
      data: { usadoEn: ahora },
    }),
  ]);

  return { mensaje: 'Correo confirmado. Ya puedes iniciar sesion.' };
}

module.exports = {
  solicitarRecuperacion,
  validarToken,
  restablecerPassword,
  enviarVerificacionEmail,
  verificarEmail,
};
