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
