const { test, describe } = require('node:test');
const assert = require('node:assert');

const limitarIntentos = require('../../src/middlewares/limitarIntentos');

// Peticion y respuesta de mentira: lo justo para que el middleware funcione.
function simular(ip) {
  return { ip, connection: {} };
}
function respuestaFalsa() {
  return { cabeceras: {}, set(k, v) { this.cabeceras[k] = v; } };
}

// Ejecuta el middleware y devuelve el error que paso a next(), o null.
function ejecutar(middleware, ip, res = respuestaFalsa()) {
  let capturado = null;
  middleware(simular(ip), res, (err) => { capturado = err || null; });
  return capturado;
}

describe('Limite de intentos', () => {
  test('deja pasar mientras no se rebasa el maximo', () => {
    const freno = limitarIntentos({ maximo: 3, ventanaMinutos: 15 });
    for (let i = 0; i < 3; i += 1) {
      assert.strictEqual(ejecutar(freno, '10.0.0.1'), null, `el intento ${i + 1} deberia pasar`);
    }
  });

  test('corta en cuanto se rebasa, con codigo 429', () => {
    const freno = limitarIntentos({ maximo: 3, ventanaMinutos: 15 });
    for (let i = 0; i < 3; i += 1) ejecutar(freno, '10.0.0.2');

    const error = ejecutar(freno, '10.0.0.2');
    assert.ok(error, 'el cuarto intento deberia cortarse');
    assert.strictEqual(error.statusCode, 429);
  });

  test('el bloqueo es por direccion: no castiga a los demas', () => {
    const freno = limitarIntentos({ maximo: 2, ventanaMinutos: 15 });
    ejecutar(freno, '10.0.0.3');
    ejecutar(freno, '10.0.0.3');
    assert.ok(ejecutar(freno, '10.0.0.3'), 'la direccion abusiva deberia estar bloqueada');
    assert.strictEqual(ejecutar(freno, '10.0.0.4'), null, 'otra direccion no deberia verse afectada');
  });

  test('avisa cuanto falta con la cabecera Retry-After', () => {
    const freno = limitarIntentos({ maximo: 1, ventanaMinutos: 15 });
    ejecutar(freno, '10.0.0.5');
    const res = respuestaFalsa();
    ejecutar(freno, '10.0.0.5', res);
    assert.ok(res.cabeceras['Retry-After'], 'falta la cabecera Retry-After');
    assert.ok(Number(res.cabeceras['Retry-After']) > 0);
  });

  test('pasada la ventana, el contador vuelve a cero', async () => {
    // Ventana de seis milisegundos expresada en minutos.
    const freno = limitarIntentos({ maximo: 1, ventanaMinutos: 0.0001 });
    ejecutar(freno, '10.0.0.6');
    assert.ok(ejecutar(freno, '10.0.0.6'), 'el segundo intento inmediato deberia cortarse');

    await new Promise((r) => setTimeout(r, 25));
    assert.strictEqual(ejecutar(freno, '10.0.0.6'), null, 'pasada la ventana deberia pasar de nuevo');
  });

  test('cada freno lleva su propio contador', () => {
    // Es lo que evita que comprobar un enlace gaste el cupo de envio de
    // correos y deje a la persona bloqueada en mitad de su recuperacion.
    const frenoA = limitarIntentos({ maximo: 1, ventanaMinutos: 15 });
    const frenoB = limitarIntentos({ maximo: 1, ventanaMinutos: 15 });
    ejecutar(frenoA, '10.0.0.7');
    assert.ok(ejecutar(frenoA, '10.0.0.7'), 'el freno A deberia haberse agotado');
    assert.strictEqual(ejecutar(frenoB, '10.0.0.7'), null, 'el freno B no deberia verse afectado');
  });
});
