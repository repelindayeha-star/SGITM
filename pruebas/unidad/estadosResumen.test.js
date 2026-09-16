const { test, describe } = require('node:test');
const assert = require('node:assert');

const { normalizarEstados, ORDEN_ESTADOS } = require('../../src/utils/estadosResumen');

// El panel devuelve un ARREGLO de {estado, cantidad}, porque asi lo entrega
// el groupBy de Prisma. Leerlo como si fuera un objeto no falla: produce
// cuentas que no son numeros, y el informe sale con celdas invalidas que ni
// Excel puede abrir. Estas pruebas existen por ese fallo concreto.
const COMO_LO_DA_EL_PANEL = [
  { estado: 'RECIBIDA', cantidad: 3 },
  { estado: 'EN_REPARACION', cantidad: 1 },
  { estado: 'ENTREGADA', cantidad: 4 },
];

describe('Resumen de ordenes por estado', () => {
  test('lee el arreglo que entrega el panel', () => {
    const r = normalizarEstados(COMO_LO_DA_EL_PANEL);
    const recibida = r.find((x) => x.estado === 'RECIBIDA');
    assert.strictEqual(recibida.cantidad, 3);
  });

  test('todas las cantidades son numeros de verdad', () => {
    for (const fila of normalizarEstados(COMO_LO_DA_EL_PANEL)) {
      assert.strictEqual(typeof fila.cantidad, 'number', `${fila.estado} no es numero`);
      assert.ok(!Number.isNaN(fila.cantidad), `${fila.estado} es NaN`);
      assert.strictEqual(typeof fila.proporcion, 'number');
      assert.ok(!Number.isNaN(fila.proporcion), `la proporcion de ${fila.estado} es NaN`);
    }
  });

  test('las proporciones suman 1', () => {
    const suma = normalizarEstados(COMO_LO_DA_EL_PANEL)
      .reduce((s, f) => s + f.proporcion, 0);
    assert.ok(Math.abs(suma - 1) < 1e-9, `sumaron ${suma}`);
  });

  test('rellena con cero los estados que el panel omite', () => {
    const r = normalizarEstados(COMO_LO_DA_EL_PANEL);
    assert.strictEqual(r.length, ORDEN_ESTADOS.length);
    const cancelada = r.find((x) => x.estado === 'CANCELADA');
    assert.strictEqual(cancelada.cantidad, 0);
    assert.strictEqual(cancelada.proporcion, 0);
  });

  test('salen en el orden del recorrido de la moto, no en otro', () => {
    const r = normalizarEstados(COMO_LO_DA_EL_PANEL).map((x) => x.estado);
    assert.deepStrictEqual(r, ORDEN_ESTADOS);
  });

  test('cada fila trae su etiqueta legible, sin guiones bajos', () => {
    for (const fila of normalizarEstados(COMO_LO_DA_EL_PANEL)) {
      assert.ok(fila.etiqueta, `${fila.estado} sin etiqueta`);
      assert.ok(!fila.etiqueta.includes('_'), `${fila.etiqueta} filtra jerga interna`);
    }
  });

  // Un taller recien instalado no tiene ninguna orden. El informe tiene que
  // salir igual, con ceros, en vez de dividir entre cero.
  test('sin ninguna orden no divide entre cero', () => {
    for (const vacio of [[], null, undefined, {}]) {
      const r = normalizarEstados(vacio);
      assert.strictEqual(r.length, ORDEN_ESTADOS.length);
      for (const fila of r) {
        assert.strictEqual(fila.cantidad, 0);
        assert.strictEqual(fila.proporcion, 0);
        assert.ok(!Number.isNaN(fila.proporcion));
      }
    }
  });

  test('tambien entiende la forma de objeto, por si cambia el repositorio', () => {
    const r = normalizarEstados({ RECIBIDA: 2, ENTREGADA: 2 });
    assert.strictEqual(r.find((x) => x.estado === 'RECIBIDA').cantidad, 2);
    assert.strictEqual(r.find((x) => x.estado === 'RECIBIDA').proporcion, 0.5);
  });

  test('marca cuales estados son trabajo abierto', () => {
    const r = normalizarEstados(COMO_LO_DA_EL_PANEL);
    assert.strictEqual(r.find((x) => x.estado === 'EN_REPARACION').abierto, true);
    assert.strictEqual(r.find((x) => x.estado === 'ENTREGADA').abierto, false);
    assert.strictEqual(r.find((x) => x.estado === 'CANCELADA').abierto, false);
  });
});
