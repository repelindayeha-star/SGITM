const { test, describe } = require('node:test');
const assert = require('node:assert');

const { PASOS_CLIENTE, pasoDeEstado, cambioVisibleParaCliente } = require('../../src/utils/pasosCliente');

describe('Pasos que ve el cliente', () => {
  test('son cinco', () => {
    assert.strictEqual(PASOS_CLIENTE.length, 5);
  });

  test('los siete estados de avance estan cubiertos, y CANCELADA queda fuera', () => {
    const cubiertos = PASOS_CLIENTE.flatMap((p) => p.estados);
    for (const estado of [
      'RECIBIDA',
      'EN_DIAGNOSTICO',
      'EN_COTIZACION',
      'APROBADA',
      'EN_REPARACION',
      'LISTA',
      'ENTREGADA',
    ]) {
      assert.ok(cubiertos.includes(estado), `${estado} no esta en ningun paso`);
    }
    // Cancelar no es avanzar: no puede aparecer en la linea de tiempo.
    assert.ok(!cubiertos.includes('CANCELADA'));
  });

  test('ningun estado cae en dos pasos a la vez', () => {
    const cubiertos = PASOS_CLIENTE.flatMap((p) => p.estados);
    assert.strictEqual(new Set(cubiertos).size, cubiertos.length);
  });

  test('cada paso tiene titulo y detalle en lenguaje de cliente', () => {
    for (const paso of PASOS_CLIENTE) {
      assert.ok(paso.titulo && paso.titulo.length > 3, `${paso.clave} sin titulo`);
      assert.ok(paso.detalle && paso.detalle.length > 10, `${paso.clave} sin detalle`);
      // Nada de jerga interna en lo que lee el cliente.
      assert.ok(!/[A-Z]{2,}_[A-Z]/.test(paso.titulo + paso.detalle), `${paso.clave} filtra jerga`);
    }
  });

  test('traduce el estado interno al paso correcto', () => {
    assert.strictEqual(pasoDeEstado('EN_DIAGNOSTICO').clave, 'REVISION');
    assert.strictEqual(pasoDeEstado('EN_COTIZACION').clave, 'REVISION');
    assert.strictEqual(pasoDeEstado('APROBADA').clave, 'REPARACION');
    assert.strictEqual(pasoDeEstado('EN_REPARACION').clave, 'REPARACION');
    assert.strictEqual(pasoDeEstado('CANCELADA'), null);
  });
});

describe('Cuando se avisa al cliente por correo', () => {
  test('avisa al entrar a un paso nuevo', () => {
    assert.ok(cambioVisibleParaCliente('RECIBIDA', 'EN_DIAGNOSTICO'));
    assert.ok(cambioVisibleParaCliente('EN_COTIZACION', 'APROBADA'));
    assert.ok(cambioVisibleParaCliente('EN_REPARACION', 'LISTA'));
    assert.ok(cambioVisibleParaCliente('LISTA', 'ENTREGADA'));
  });

  // Lo importante de esta regla: para el taller pasar de diagnostico a
  // cotizacion es un cambio real; para el cliente los dos son "la estamos
  // revisando". Dos correos identicos hacen que deje de abrirlos, y entonces
  // tampoco abre el que si importa: "tu moto esta lista".
  test('NO avisa si el paso visible no cambia', () => {
    assert.ok(!cambioVisibleParaCliente('EN_DIAGNOSTICO', 'EN_COTIZACION'));
    assert.ok(!cambioVisibleParaCliente('APROBADA', 'EN_REPARACION'));
  });

  test('siempre avisa de una cancelacion, venga del estado que venga', () => {
    for (const desde of ['RECIBIDA', 'EN_DIAGNOSTICO', 'EN_COTIZACION', 'APROBADA', 'EN_REPARACION']) {
      assert.ok(cambioVisibleParaCliente(desde, 'CANCELADA'), `cancelar desde ${desde}`);
    }
  });

  test('avisa de la apertura de la orden, cuando no hay estado anterior', () => {
    assert.ok(cambioVisibleParaCliente(null, 'RECIBIDA'));
  });

  test('un estado desconocido no dispara ningun correo', () => {
    assert.ok(!cambioVisibleParaCliente('RECIBIDA', 'LO_QUE_SEA'));
  });
});
