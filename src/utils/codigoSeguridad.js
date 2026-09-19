const crypto = require('crypto');

// Codigos de seis digitos para verificar un correo o recuperar una contrasena.
//
// Por que un codigo y no un enlace: el cliente de un taller abre el correo en
// el celular y teclea seis numeros en la pantalla que ya tiene abierta. Con un
// enlace tiene que saltar entre aplicaciones, y si el correo le llega al
// computador y esta frente al mostrador, el enlace no le sirve de nada.
//
// El precio de esa comodidad es que seis digitos son solo un millon de
// combinaciones: un enlace de 32 bytes no se adivina nunca, un codigo de seis
// digitos si. Por eso este modulo NO se puede usar solo; va siempre con las
// tres defensas de abajo, y las tres son obligatorias:
//
//   1. Caducidad corta          -> QUINCE_MINUTOS
//   2. Numero de intentos       -> MAX_INTENTOS, y al agotarlos el codigo muere
//   3. Freno por direccion IP   -> el middleware limitarIntentos, en la ruta
//
// Sin las tres, un atacante prueba el millon de combinaciones y entra.

const LONGITUD = 6;
const MAX_INTENTOS = 5;

const CADUCIDAD_MINUTOS = {
  RECUPERACION_PASSWORD: 15,
  VERIFICACION_EMAIL: 30,
};

/**
 * Genera un codigo de seis digitos.
 *
 * Usa randomInt, que es el generador criptografico, y no Math.random: con
 * Math.random la secuencia es predecible si se conoce el estado interno, y
 * adivinar el codigo de otro seria cuestion de calcularlo, no de acertarlo.
 *
 * El rango es 0..999999 y despues se rellena con ceros a la izquierda, para
 * que el 42 sea "000042" y no un codigo mas corto y por tanto mas facil.
 */
function generarCodigo() {
  const numero = crypto.randomInt(0, 10 ** LONGITUD);
  return String(numero).padStart(LONGITUD, '0');
}

/**
 * Huella del codigo, para guardarla en la base en vez del codigo.
 *
 * Va mezclado con el identificador del usuario, y eso resuelve dos problemas
 * de una vez:
 *
 *   - Un SHA-256 de seis digitos se revierte en segundos: solo hay un millon
 *     de huellas posibles y se precalculan todas. Mezclando el identificador,
 *     cada usuario tiene su propio juego de huellas y esa tabla no sirve.
 *
 *   - La columna de huellas es unica en la base. Dos usuarios pueden sacar el
 *     mismo codigo el mismo dia por pura probabilidad; sin mezclar, el segundo
 *     choca contra la restriccion y el sistema le niega algo legitimo.
 */
function hashearCodigo(usuarioId, codigo) {
  if (!usuarioId) {
    throw new Error('Falta el identificador del usuario para huellar el codigo.');
  }
  return crypto.createHash('sha256').update(`${usuarioId}:${codigo}`).digest('hex');
}

function calcularExpiracion(tipo) {
  const minutos = CADUCIDAD_MINUTOS[tipo];
  if (!minutos) {
    throw new Error(`Tipo de codigo desconocido: ${tipo}`);
  }
  return new Date(Date.now() + minutos * 60 * 1000);
}

/**
 * Decide que hacer con un intento, sin tocar la base de datos.
 *
 * Se separa a proposito de quien consulta y escribe: asi la regla se puede
 * probar sola, sin levantar PostgreSQL, y el servicio queda con una sola
 * responsabilidad. Devuelve siempre la misma forma para que el llamador no
 * tenga que adivinar.
 */
function evaluarIntento({ registro, usuarioId, codigo, ahora = new Date() }) {
  if (!registro) {
    return { valido: false, motivo: 'INEXISTENTE', agotado: false };
  }
  if (registro.usadoEn) {
    return { valido: false, motivo: 'YA_USADO', agotado: false };
  }
  if (registro.expiraEn <= ahora) {
    return { valido: false, motivo: 'CADUCADO', agotado: false };
  }
  if ((registro.intentos || 0) >= MAX_INTENTOS) {
    return { valido: false, motivo: 'INTENTOS_AGOTADOS', agotado: true };
  }

  const coincide = registro.tokenHash === hashearCodigo(usuarioId, codigo);
  if (!coincide) {
    const intentosTras = (registro.intentos || 0) + 1;
    return {
      valido: false,
      motivo: 'NO_COINCIDE',
      agotado: intentosTras >= MAX_INTENTOS,
      intentosRestantes: Math.max(0, MAX_INTENTOS - intentosTras),
    };
  }

  return { valido: true, motivo: null, agotado: false };
}

/**
 * Mensaje para el usuario.
 *
 * Todos los fallos dicen lo mismo a proposito, salvo el de intentos agotados.
 * Si el sistema distinguiera "ese codigo no existe" de "ese codigo caduco",
 * estaria confirmando cuales existen, y eso es justo lo que no queremos
 * regalarle a quien esta probando codigos.
 */
function mensajeDeMotivo(motivo) {
  if (motivo === 'INTENTOS_AGOTADOS') {
    return 'Superaste el numero de intentos. Pide un codigo nuevo.';
  }
  return 'El codigo no es valido o ya caduco. Pide uno nuevo.';
}

module.exports = {
  LONGITUD,
  MAX_INTENTOS,
  CADUCIDAD_MINUTOS,
  generarCodigo,
  hashearCodigo,
  calcularExpiracion,
  evaluarIntento,
  mensajeDeMotivo,
};
