const { PASOS_CLIENTE } = require('./pasosCliente');

// Orden en que tiene sentido leer los estados: el recorrido real de una moto
// por el taller, no el alfabetico ni el de mayor a menor cantidad.
const ORDEN_ESTADOS = [
  'RECIBIDA',
  'EN_DIAGNOSTICO',
  'EN_COTIZACION',
  'APROBADA',
  'EN_REPARACION',
  'LISTA',
  'ENTREGADA',
  'CANCELADA',
];

const ETIQUETA_ESTADO = {
  RECIBIDA: 'Recibida',
  EN_DIAGNOSTICO: 'En diagnostico',
  EN_COTIZACION: 'En cotizacion',
  APROBADA: 'Aprobada',
  EN_REPARACION: 'En reparacion',
  LISTA: 'Lista para recoger',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

// Estados en los que la moto todavia esta en manos del taller.
const ABIERTOS = ['RECIBIDA', 'EN_DIAGNOSTICO', 'EN_COTIZACION', 'APROBADA', 'EN_REPARACION'];

/**
 * Normaliza el conteo por estado que entrega el panel.
 *
 * El repositorio devuelve un ARREGLO de {estado, cantidad}, porque asi lo da
 * el groupBy de Prisma. Leerlo como si fuera un objeto {ESTADO: numero} es un
 * error silencioso: no falla, simplemente produce cuentas que no son numeros,
 * y el informe sale con celdas invalidas. Paso por aqui para que ese error no
 * se pueda cometer dos veces.
 *
 * Ademas rellena con cero los estados que groupBy omite por no tener ninguna
 * orden: en un informe, "cero en reparacion" es un dato, y una fila ausente
 * se lee como un olvido.
 */
function normalizarEstados(ordenesPorEstado, { incluirVacios = true } = {}) {
  const cuenta = new Map();

  if (Array.isArray(ordenesPorEstado)) {
    for (const fila of ordenesPorEstado) {
      cuenta.set(fila.estado, Number(fila.cantidad) || 0);
    }
  } else if (ordenesPorEstado && typeof ordenesPorEstado === 'object') {
    // Por si alguna vez cambia la forma en el repositorio.
    for (const [estado, cantidad] of Object.entries(ordenesPorEstado)) {
      cuenta.set(estado, Number(cantidad) || 0);
    }
  }

  const total = [...cuenta.values()].reduce((s, n) => s + n, 0);

  return ORDEN_ESTADOS.filter((e) => incluirVacios || cuenta.has(e)).map((estado) => ({
    estado,
    etiqueta: ETIQUETA_ESTADO[estado] || estado,
    cantidad: cuenta.get(estado) || 0,
    // Proporcion sobre el total, ya calculada: que ningun informe la divida
    // por su cuenta y se arriesgue a dividir entre cero.
    proporcion: total > 0 ? (cuenta.get(estado) || 0) / total : 0,
    abierto: ABIERTOS.includes(estado),
  }));
}

module.exports = { normalizarEstados, ETIQUETA_ESTADO, ABIERTOS, ORDEN_ESTADOS, PASOS_CLIENTE };
