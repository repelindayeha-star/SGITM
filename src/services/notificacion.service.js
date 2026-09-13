const correoService = require('./correo.service');
const plantillas = require('../plantillas/correo');
const { pasoDeEstado, cambioVisibleParaCliente } = require('../utils/pasosCliente');
const env = require('../config/env');

/**
 * Avisa al cliente de que su moto cambio de etapa.
 *
 * Esta funcion NUNCA lanza. Si el correo falla, la orden ya quedo guardada y
 * el historial ya tiene su asiento: seria absurdo tumbar la operacion del
 * taller porque el servidor de correo no responde. Lo que no se pudo enviar
 * queda en la consola.
 *
 * Devuelve por que se envio o por que no, para poder comprobarlo en pruebas.
 */
async function avisarCambioDeEstado(orden, estadoAnterior, nota) {
  try {
    if (!orden) return { enviado: false, motivo: 'sin orden' };

    const destinatario = orden.cliente?.usuario;
    if (!destinatario?.email) {
      return { enviado: false, motivo: 'el cliente no tiene correo' };
    }

    if (!cambioVisibleParaCliente(estadoAnterior, orden.estado)) {
      // Cambio interno del taller que para el cliente no significa nada
      // nuevo. Ver el comentario en utils/pasosCliente.js.
      return { enviado: false, motivo: 'el cambio no altera el paso visible' };
    }

    const moto = orden.motocicleta
      ? `${orden.motocicleta.marca} ${orden.motocicleta.modelo}`
      : null;
    const enlace = `${env.urlFrontend}/seguimiento/${orden.codigo}`;

    const mensaje =
      orden.estado === 'CANCELADA'
        ? plantillas.ordenCancelada({
            nombre: destinatario.nombre,
            codigo: orden.codigo,
            moto,
            motivo: nota,
            enlace,
          })
        : plantillas.cambioEstadoOrden({
            nombre: destinatario.nombre,
            codigo: orden.codigo,
            moto,
            paso: pasoDeEstado(orden.estado).titulo,
            descripcion: pasoDeEstado(orden.estado).detalle,
            enlace,
          });

    const resultado = await correoService.enviar({ para: destinatario.email, ...mensaje });
    return { enviado: resultado.enviado, motivo: resultado.enviado ? 'enviado' : resultado.error };
  } catch (error) {
    console.error(`[notificacion] Fallo al avisar del cambio de estado: ${error.message}`);
    return { enviado: false, motivo: error.message };
  }
}

module.exports = { avisarCambioDeEstado };
