const { test, describe } = require('node:test');
const assert = require('node:assert');

// Se cargan solo las transiciones: no hace falta base de datos para
// comprobar una regla de negocio que es pura.
const { TRANSICIONES_VALIDAS } = require('../../src/services/ordenTrabajo.service');

const ESTADOS = [
  'RECIBIDA',
  'EN_DIAGNOSTICO',
  'EN_COTIZACION',
  'APROBADA',
  'EN_REPARACION',
  'LISTA',
  'ENTREGADA',
  'CANCELADA',
];

describe('Maquina de estados de la orden de trabajo', () => {
  test('los ocho estados estan declarados', () => {
    assert.deepStrictEqual(Object.keys(TRANSICIONES_VALIDAS).sort(), [...ESTADOS].sort());
  });

  test('ninguna transicion apunta a un estado inexistente', () => {
    for (const [origen, destinos] of Object.entries(TRANSICIONES_VALIDAS)) {
      for (const destino of destinos) {
        assert.ok(ESTADOS.includes(destino), `${origen} apunta a ${destino}, que no existe`);
      }
    }
  });

  test('el camino normal del taller es el esperado', () => {
    const camino = [
      ['RECIBIDA', 'EN_DIAGNOSTICO'],
      ['EN_DIAGNOSTICO', 'EN_COTIZACION'],
      ['EN_COTIZACION', 'APROBADA'],
      ['APROBADA', 'EN_REPARACION'],
      ['EN_REPARACION', 'LISTA'],
      ['LISTA', 'ENTREGADA'],
    ];
    for (const [desde, hasta] of camino) {
      assert.ok(
        TRANSICIONES_VALIDAS[desde].includes(hasta),
        `deberia poder pasar de ${desde} a ${hasta}`
      );
    }
  });

  test('no se puede saltar etapas', () => {
    assert.ok(!TRANSICIONES_VALIDAS.RECIBIDA.includes('ENTREGADA'));
    assert.ok(!TRANSICIONES_VALIDAS.RECIBIDA.includes('LISTA'));
    assert.ok(!TRANSICIONES_VALIDAS.EN_DIAGNOSTICO.includes('EN_REPARACION'));
  });

  test('no se puede retroceder', () => {
    assert.ok(!TRANSICIONES_VALIDAS.EN_COTIZACION.includes('RECIBIDA'));
    assert.ok(!TRANSICIONES_VALIDAS.LISTA.includes('EN_REPARACION'));
  });

  // ENTREGADA y CANCELADA son terminales: una orden cerrada no vuelve a
  // moverse. Si alguien pudiera reabrirla, la factura y el historial dejarian
  // de corresponderse con la realidad.
  test('los estados terminales no admiten mas cambios', () => {
    assert.deepStrictEqual(TRANSICIONES_VALIDAS.ENTREGADA, []);
    assert.deepStrictEqual(TRANSICIONES_VALIDAS.CANCELADA, []);
  });

  test('se puede cancelar desde cualquier estado abierto, pero no desde LISTA', () => {
    const abiertos = ['RECIBIDA', 'EN_DIAGNOSTICO', 'EN_COTIZACION', 'APROBADA', 'EN_REPARACION'];
    for (const estado of abiertos) {
      assert.ok(TRANSICIONES_VALIDAS[estado].includes('CANCELADA'), `${estado} deberia cancelarse`);
    }
    // Una moto ya reparada no se cancela: se entrega y se cobra.
    assert.ok(!TRANSICIONES_VALIDAS.LISTA.includes('CANCELADA'));
  });

  test('ningun estado permite quedarse en si mismo', () => {
    for (const [origen, destinos] of Object.entries(TRANSICIONES_VALIDAS)) {
      assert.ok(!destinos.includes(origen), `${origen} no deberia transitar a si mismo`);
    }
  });
});
