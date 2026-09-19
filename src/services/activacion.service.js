const crypto = require('crypto');
const bcrypt = require('bcrypt');

const prisma = require('../config/prismaClient');
const usuarioRepository = require('../repositories/usuario.repository');
const tokenRepository = require('../repositories/tokenSeguridad.repository');
const correoService = require('./correo.service');
const plantillas = require('../plantillas/correo');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const {
  generarCodigo,
  hashearCodigo,
  calcularExpiracion,
  evaluarIntento,
  mensajeDeMotivo,
  CADUCIDAD_MINUTOS,
  MAX_INTENTOS,
} = require('../utils/codigoSeguridad');

const SALT_ROUNDS = 10;

/**
 * Alta de un cliente desde el mostrador.
 *
 * Antes esto se hacia llamando al registro publico, y traia tres problemas:
 * la recepcionista tenia que INVENTAR la contrasena del cliente (y por tanto
 * conocerla), tenia que resolver un captcha estando ya autenticada, y el
 * freno de cinco registros cada quince minutos bloqueaba al taller en una
 * manana normal de trabajo.
 *
 * Aqui la cuenta nace SIN contrasena utilizable. Lo que se le guarda es la
 * huella de un valor aleatorio que nadie conoce ni puede llegar a conocer:
 * asi ninguna contrasena la abre, y la unica via de entrada es el codigo que
 * le llega al cliente a su correo. Nadie del taller puede entrar como el.
 */
async function crearClienteDesdeRecepcion({ nombre, email, telefono, direccion }) {
  const existente = await usuarioRepository.buscarPorEmail(email);
  if (existente) {
    throw new AppError('Ya hay una cuenta registrada con ese correo.', 409);
  }

  // Una contrasena que nadie sabe y que nadie puede adivinar. No se guarda
  // una cadena fija tipo "sin-establecer" a proposito: si manana alguien
  // cambiara la comparacion, una cadena conocida podria volverse una llave.
  const passwordImposible = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);

  const codigo = generarCodigo();

  // Las tres escrituras van juntas. Si se hicieran sueltas y fallara la de en
  // medio, quedaria un usuario sin perfil de cliente, o un cliente sin codigo
  // con el que activarse: en los dos casos una cuenta muerta que hay que
  // arreglar a mano en la base.
  const { usuario, cliente } = await prisma.$transaction(async (tx) => {
    const usuarioCreado = await tx.usuario.create({
      data: {
        nombre,
        email,
        password: passwordImposible,
        rol: 'CLIENTE',
        emailVerificado: false,
      },
    });

    const clienteCreado = await tx.cliente.create({
      data: { usuarioId: usuarioCreado.id, telefono, direccion: direccion || null },
    });

    await tx.tokenSeguridad.create({
      data: {
        usuarioId: usuarioCreado.id,
        tokenHash: hashearCodigo(usuarioCreado.id, codigo),
        tipo: 'VERIFICACION_EMAIL',
        expiraEn: calcularExpiracion('VERIFICACION_EMAIL'),
      },
    });

    return { usuario: usuarioCreado, cliente: clienteCreado };
  });

  // El correo no bloquea la respuesta: el cliente ya quedo registrado aunque
  // el proveedor de correo este caido. Si no sale, la recepcionista lo reenvia.
  const mensaje = plantillas.codigoActivacion({
    nombre: usuario.nombre,
    codigo,
    minutos: CADUCIDAD_MINUTOS.VERIFICACION_EMAIL,
    enlacePantalla: `${env.urlFrontend}/activar`,
  });
  const envio = await correoService.enviar({ para: usuario.email, ...mensaje });

  const { password: _, ...usuarioSinPassword } = usuario;
  return {
    cliente: { ...cliente, usuario: usuarioSinPassword },
    correoEnviado: envio.enviado,
  };
}

/**
 * Manda un codigo nuevo.
 *
 * Responde siempre lo mismo, exista la cuenta o no: si dijera "ese correo no
 * esta registrado", cualquiera podria averiguar probando direcciones quien
 * tiene cuenta en el taller.
 */
async function enviarCodigo({ email, tipo }) {
  const usuario = await usuarioRepository.buscarPorEmail(email);

  if (usuario && usuario.activo) {
    await tokenRepository.invalidarAnteriores(usuario.id, tipo);

    const codigo = generarCodigo();
    await tokenRepository.crear({
      usuarioId: usuario.id,
      tokenHash: hashearCodigo(usuario.id, codigo),
      tipo,
      expiraEn: calcularExpiracion(tipo),
    });

    const minutos = CADUCIDAD_MINUTOS[tipo];
    const mensaje =
      tipo === 'VERIFICACION_EMAIL'
        ? plantillas.codigoActivacion({
            nombre: usuario.nombre,
            codigo,
            minutos,
            enlacePantalla: `${env.urlFrontend}/activar`,
          })
        : plantillas.codigoRecuperacion({
            nombre: usuario.nombre,
            codigo,
            minutos,
            enlacePantalla: `${env.urlFrontend}/recuperar-codigo`,
          });

    await correoService.enviar({ para: usuario.email, ...mensaje });
  }

  return {
    mensaje: 'Si ese correo corresponde a una cuenta activa, te enviamos un codigo.',
  };
}

/**
 * Comprueba el codigo y deja la contrasena que el cliente eligio.
 *
 * Los fallos NO distinguen entre "ese correo no existe", "el codigo caduco" y
 * "el codigo esta mal": todos responden igual. Distinguirlos le confirmaria a
 * quien esta probando cuales correos existen y cuales codigos siguen vivos,
 * que es justo lo que no se le puede regalar cuando el secreto son seis
 * digitos.
 *
 * Cada fallo suma un intento sobre el codigo, y al quinto el codigo muere.
 * Esa es la defensa que hace que un millon de combinaciones no se puedan
 * recorrer: el freno por direccion IP de la ruta es la segunda capa, no la
 * unica, y por eso sigue protegiendo aunque el servidor corra repartido en
 * varias instancias, donde un contador en memoria no serviria.
 */
async function confirmarCodigo({ email, codigo, password, tipo }) {
  const usuario = await usuarioRepository.buscarPorEmail(email);

  // Sin cuenta no hay nada que comprobar, pero se responde igual que con un
  // codigo equivocado.
  if (!usuario || !usuario.activo) {
    throw new AppError(mensajeDeMotivo('INEXISTENTE'), 400);
  }

  const registro = await tokenRepository.buscarActivo(usuario.id, tipo);
  const veredicto = evaluarIntento({ registro, usuarioId: usuario.id, codigo });

  if (!veredicto.valido) {
    // Solo se suma el intento cuando hay un codigo vivo contra el que fallar.
    if (registro && veredicto.motivo === 'NO_COINCIDE') {
      await tokenRepository.sumarIntento(registro.id);
      if (veredicto.agotado) {
        await tokenRepository.marcarUsado(registro.id);
      }
    }
    throw new AppError(mensajeDeMotivo(veredicto.motivo), 400);
  }

  const passwordHasheada = await bcrypt.hash(password, SALT_ROUNDS);
  const ahora = new Date();

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: passwordHasheada,
        passwordCambiadaEn: ahora,
        // Poner la contrasena con un codigo que solo llego a ese buzon ES la
        // prueba de que el correo es suyo. Por eso aqui el correo queda
        // verificado de verdad, y no como un campo decorativo.
        emailVerificado: true,
      },
    }),
    prisma.tokenSeguridad.update({
      where: { id: registro.id },
      data: { usadoEn: ahora },
    }),
    // Cualquier otro codigo pendiente de esta cuenta deja de servir, del tipo
    // que sea: si alguien pidio varios, no pueden quedar vivos.
    prisma.tokenSeguridad.updateMany({
      where: { usuarioId: usuario.id, usadoEn: null },
      data: { usadoEn: ahora },
    }),
  ]);

  return {
    mensaje: 'Listo. Tu cuenta quedo activa y tu contrasena guardada. Ya puedes entrar.',
  };
}

module.exports = {
  crearClienteDesdeRecepcion,
  enviarCodigo,
  confirmarCodigo,
  MAX_INTENTOS,
};
