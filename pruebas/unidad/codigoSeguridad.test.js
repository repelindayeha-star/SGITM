const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
  LONGITUD,
  MAX_INTENTOS,
  generarCodigo,
  hashearCodigo,
  calcularExpiracion,
  evaluarIntento,
  mensajeDeMotivo,
} = require('../../src/utils/codigoSeguridad');

const USUARIO = '11111111-1111-1111-1111-111111111111';
const OTRO_USUARIO = '22222222-2222-2222-2222-222222222222';

function registroValido(codigo, extra = {}) {
  return {
    tokenHash: hashearCodigo(USUARIO, codigo),
    expiraEn: new Date(Date.now() + 10 * 60 * 1000),
    usadoEn: null,
    intentos: 0,
    ...extra,
  };
}

describe('Codigos de verificacion', () => {
  test('tiene siempre seis digitos, incluso cuando el numero es pequeno', () => {
    // Se generan muchos para que salga alguno por debajo de 100000, que es
    // justo el caso donde un padStart mal hecho devolveria un codigo corto.
    for (let i = 0; i < 3000; i += 1) {
      const codigo = generarCodigo();
      assert.strictEqual(codigo.length, LONGITUD, `codigo corto: ${codigo}`);
      assert.match(codigo, /^[0-9]{6}$/);
    }
  });

  test('no se repite siempre el mismo', () => {
    const vistos = new Set();
    for (let i = 0; i < 200; i += 1) vistos.add(generarCodigo());
    // Con 200 tiradas sobre un millon, repetir mas de dos veces seria senal
    // de que el generador esta roto.
    assert.ok(vistos.size > 195, `demasiadas repeticiones: ${vistos.size}/200`);
  });

  test('el mismo codigo de dos usuarios distintos da huellas distintas', () => {
    // Esto es lo que evita que choquen contra la columna unica, y lo que
    // impide precalcular una tabla de huellas que sirva para todos.
    const codigo = '123456';
    assert.notStrictEqual(hashearCodigo(USUARIO, codigo), hashearCodigo(OTRO_USUARIO, codigo));
  });

  test('la huella es estable para el mismo par', () => {
    assert.strictEqual(hashearCodigo(USUARIO, '999888'), hashearCodigo(USUARIO, '999888'));
  });

  test('huellar sin usuario falla en vez de generar algo debil', () => {
    assert.throws(() => hashearCodigo(null, '123456'));
    assert.throws(() => hashearCodigo('', '123456'));
  });

  test('un tipo desconocido falla en vez de inventar una caducidad', () => {
    assert.throws(() => calcularExpiracion('LO_QUE_SEA'));
  });

  test('la caducidad de recuperacion es mas corta que la de verificacion', () => {
    const r = calcularExpiracion('RECUPERACION_PASSWORD');
    const v = calcularExpiracion('VERIFICACION_EMAIL');
    assert.ok(r < v, 'recuperar una contrasena debe caducar antes que verificar un correo');
  });
});

describe('Evaluacion de un intento', () => {
  test('acepta el codigo correcto', () => {
    const r = evaluarIntento({ registro: registroValido('654321'), usuarioId: USUARIO, codigo: '654321' });
    assert.strictEqual(r.valido, true);
  });

  test('rechaza un codigo que no existe', () => {
    const r = evaluarIntento({ registro: null, usuarioId: USUARIO, codigo: '654321' });
    assert.strictEqual(r.valido, false);
    assert.strictEqual(r.motivo, 'INEXISTENTE');
  });

  test('rechaza un codigo ya usado', () => {
    const registro = registroValido('654321', { usadoEn: new Date() });
    const r = evaluarIntento({ registro, usuarioId: USUARIO, codigo: '654321' });
    assert.strictEqual(r.valido, false);
    assert.strictEqual(r.motivo, 'YA_USADO');
  });

  test('rechaza un codigo caducado aunque sea el correcto', () => {
    const registro = registroValido('654321', { expiraEn: new Date(Date.now() - 1000) });
    const r = evaluarIntento({ registro, usuarioId: USUARIO, codigo: '654321' });
    assert.strictEqual(r.valido, false);
    assert.strictEqual(r.motivo, 'CADUCADO');
  });

  test('rechaza el codigo de otro usuario aunque los digitos coincidan', () => {
    // El caso que importa: dos personas con el mismo codigo el mismo dia.
    const registro = registroValido('654321');
    const r = evaluarIntento({ registro, usuarioId: OTRO_USUARIO, codigo: '654321' });
    assert.strictEqual(r.valido, false);
    assert.strictEqual(r.motivo, 'NO_COINCIDE');
  });

  test('cuenta los intentos y avisa cuantos quedan', () => {
    const registro = registroValido('654321', { intentos: 2 });
    const r = evaluarIntento({ registro, usuarioId: USUARIO, codigo: '000000' });
    assert.strictEqual(r.valido, false);
    assert.strictEqual(r.intentosRestantes, MAX_INTENTOS - 3);
  });

  test('al llegar al ultimo intento fallido marca el codigo como agotado', () => {
    const registro = registroValido('654321', { intentos: MAX_INTENTOS - 1 });
    const r = evaluarIntento({ registro, usuarioId: USUARIO, codigo: '000000' });
    assert.strictEqual(r.agotado, true);
    assert.strictEqual(r.intentosRestantes, 0);
  });

  test('con los intentos agotados ni siquiera acepta el codigo correcto', () => {
    // Es la defensa que hace que un millon de combinaciones no se puedan
    // recorrer: el codigo muere antes de que valga la pena seguir probando.
    const registro = registroValido('654321', { intentos: MAX_INTENTOS });
    const r = evaluarIntento({ registro, usuarioId: USUARIO, codigo: '654321' });
    assert.strictEqual(r.valido, false);
    assert.strictEqual(r.motivo, 'INTENTOS_AGOTADOS');
  });

  test('no revela si el codigo existia, caduco o estaba mal', () => {
    const iguales = ['INEXISTENTE', 'CADUCADO', 'NO_COINCIDE', 'YA_USADO'].map(mensajeDeMotivo);
    assert.strictEqual(new Set(iguales).size, 1, 'los mensajes deben ser indistinguibles');
    assert.notStrictEqual(mensajeDeMotivo('INTENTOS_AGOTADOS'), iguales[0]);
  });
});
