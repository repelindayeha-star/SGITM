// Espejo exacto de la maquina de estados definida en el backend
// (src/services/ordenTrabajo.service.js -> TRANSICIONES_VALIDAS).
// Se usa para que la interfaz solo ofrezca transiciones que el backend
// realmente va a aceptar, evitando errores 400 innecesarios.
export const TRANSICIONES_VALIDAS_ORDEN = {
  RECIBIDA: ['EN_DIAGNOSTICO', 'CANCELADA'],
  EN_DIAGNOSTICO: ['EN_COTIZACION', 'CANCELADA'],
  EN_COTIZACION: ['APROBADA', 'CANCELADA'],
  APROBADA: ['EN_REPARACION', 'CANCELADA'],
  EN_REPARACION: ['LISTA', 'CANCELADA'],
  LISTA: ['ENTREGADA'],
  ENTREGADA: [],
  CANCELADA: [],
};

export const ETIQUETAS_ESTADO_ORDEN = {
  RECIBIDA: 'Recibida',
  EN_DIAGNOSTICO: 'En diagnostico',
  EN_COTIZACION: 'En cotizacion',
  APROBADA: 'Aprobada',
  EN_REPARACION: 'En reparacion',
  LISTA: 'Lista',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export function transicionesDisponibles(estadoActual) {
  return TRANSICIONES_VALIDAS_ORDEN[estadoActual] || [];
}

// ── Linea de tiempo para el cliente ────────────────────────────────────
// Los ocho estados internos se agrupan en cinco pasos legibles. El cliente
// no necesita distinguir APROBADA de EN_REPARACION: para el son el mismo
// momento, "estan trabajando en mi moto". CANCELADA queda fuera de la linea
// a proposito, porque no es un avance sino una salida.
export const PASOS_CLIENTE = [
  {
    clave: 'RECIBIDA',
    titulo: 'Recibimos tu moto',
    detalle: 'La orden quedo registrada en el taller.',
    estados: ['RECIBIDA'],
  },
  {
    clave: 'REVISION',
    titulo: 'La estamos revisando',
    detalle: 'Diagnostico del problema y cotizacion del trabajo.',
    estados: ['EN_DIAGNOSTICO', 'EN_COTIZACION'],
  },
  {
    clave: 'REPARACION',
    titulo: 'En reparacion',
    detalle: 'Trabajo aprobado y en ejecucion.',
    estados: ['APROBADA', 'EN_REPARACION'],
  },
  {
    clave: 'LISTA',
    titulo: 'Lista para recoger',
    detalle: 'Puedes pasar por ella cuando quieras.',
    estados: ['LISTA'],
  },
  {
    clave: 'ENTREGADA',
    titulo: 'Entregada',
    detalle: 'Trabajo terminado.',
    estados: ['ENTREGADA'],
  },
];

export function indicePasoDeEstado(estado) {
  return PASOS_CLIENTE.findIndex((paso) => paso.estados.includes(estado));
}

/**
 * Primer asiento del historial en que la orden entro a este paso.
 * Devuelve null si todavia no ha llegado, y entonces el paso se pinta
 * pendiente y sin fecha.
 */
export function asientoDePaso(paso, historial = []) {
  return historial.find((asiento) => paso.estados.includes(asiento.estadoNuevo)) || null;
}
