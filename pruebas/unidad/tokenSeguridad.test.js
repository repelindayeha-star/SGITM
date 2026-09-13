const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
  generarToken,
  hashear,
  calcularExpiracion,
  CADUCIDAD_MINUTOS,
} = require('../../src/utils/tokenSeguridad');

describe('Tokens de seguridad', () => {
  test('cada token es distinto del anterior', () => {
    const vistos = new Set();
    for (let i = 0; i < 500; i += 1) {
      vistos.add(generarToken().token);
    }
    assert.strictEqual(vistos.size, 500, 'se repitio algun token');
  });

  test('el token tiene suficiente entropia para no adivinarse', () => {
    // 32 bytes en base64url dan 43 caracteres. Con menos, un enlace de
    // recuperacion se podria encontrar probando.
    const { token } = generarToken();
    assert.ok(token.length >= 43, `demasiado corto: ${token.length}`);
    assert.match(token, /^[A-Za-z0-9_-]+$/, 'debe ser seguro para una direccion web');
  });

  test('lo que se guarda es la huella, nunca el token', () => {
    const { token, tokenHash } = generarToken();
    assert.notStrictEqual(token, tokenHash);
    assert.strictEqual(tokenHash.length, 64, 'SHA-256 en hexadecimal son 64 caracteres');
    assert.ok(!tokenHash.includes(token));
  });

  test('la huella es reproducible: el mismo token da la misma huella', () => {
    const { token, tokenHash } = generarToken();
    assert.strictEqual(hashear(token), tokenHash);
  });

  test('cambiar un solo caracter cambia la huella entera', () => {
    const a = hashear('token-de-ejemplo');
    const b = hashear('token-de-ejempla');
    assert.notStrictEqual(a, b);
  });

  test('el enlace de recuperacion caduca en 30 minutos', () => {
    assert.strictEqual(CADUCIDAD_MINUTOS.RECUPERACION_PASSWORD, 30);
    const margen = calcularExpiracion('RECUPERACION_PASSWORD').getTime() - Date.now();
    assert.ok(margen > 29 * 60 * 1000 && margen <= 30 * 60 * 1000, `margen inesperado: ${margen}`);
  });

  test('el de confirmacion de correo dura un dia', () => {
    assert.strictEqual(CADUCIDAD_MINUTOS.VERIFICACION_EMAIL, 1440);
  });

  test('un tipo desconocido falla en vez de inventar una caducidad', () => {
    assert.throws(() => calcularExpiracion('LO_QUE_SEA'), /Tipo de token desconocido/);
  });
});
