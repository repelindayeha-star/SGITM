// Los ocho estados internos, traducidos a los cinco pasos que ve el cliente.
//
// Espejo de frontend/src/utils/estadosOrden.js. Tiene que decir lo mismo que
// la pantalla: si el correo dice "la estamos revisando" y el portal dice otra
// cosa, el cliente llama al taller a preguntar cual de las dos es verdad, que
// es justo la llamada que esta aplicacion existe para evitar.
//
// El cliente no necesita distinguir APROBADA de EN_REPARACION: para el son el
// mismo momento, "estan trabajando en mi moto".
const PASOS_CLIENTE = [
  {
    clave: 'RECIBIDA',
    titulo: 'Recibimos tu moto',
    detalle: 'La orden quedo registrada en el taller.',
    estados: ['RECIBIDA'],
  },
  {
    clave: 'REVISION',
    titulo: 'La estamos revisando',
    detalle: 'Estamos diagnosticando el problema y preparando la cotizacion.',
    estados: ['EN_DIAGNOSTICO', 'EN_COTIZACION'],
  },
  {
    clave: 'REPARACION',
    titulo: 'En reparacion',
    detalle: 'El trabajo quedo aprobado y ya esta en ejecucion.',
    estados: ['APROBADA', 'EN_REPARACION'],
  },
  {
    clave: 'LISTA',
    titulo: 'Lista para recoger',
    detalle: 'Tu moto ya esta lista. Puedes pasar por ella cuando quieras.',
    estados: ['LISTA'],
  },
  {
    clave: 'ENTREGADA',
    titulo: 'Entregada',
    detalle: 'Trabajo terminado. Gracias por confiar en nosotros.',
    estados: ['ENTREGADA'],
  },
];

function pasoDeEstado(estado) {
  return PASOS_CLIENTE.find((paso) => paso.estados.includes(estado)) || null;
}

/**
 * ¿Este cambio de estado merece un correo?
 *
 * Solo si el cliente pasa de un paso a otro. De EN_DIAGNOSTICO a
 * EN_COTIZACION hay un cambio real para el taller, pero para el cliente los
 * dos son "la estamos revisando": mandarle dos correos con el mismo texto
 * hace que deje de abrirlos, y entonces tampoco abre el que importa, el de
 * "tu moto esta lista".
 */
function cambioVisibleParaCliente(estadoAnterior, estadoNuevo) {
  if (estadoNuevo === 'CANCELADA') return true;
  const antes = pasoDeEstado(estadoAnterior);
  const ahora = pasoDeEstado(estadoNuevo);
  if (!ahora) return false;
  return !antes || antes.clave !== ahora.clave;
}

module.exports = { PASOS_CLIENTE, pasoDeEstado, cambioVisibleParaCliente };
