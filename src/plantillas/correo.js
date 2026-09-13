// Plantillas de los correos que envia el sistema.
//
// Van con estilos en linea y sobre tablas a proposito: los clientes de correo
// (Gmail, Outlook) ignoran las hojas de estilo y buena parte de CSS moderno.
// Lo que aqui parece anticuado es lo unico que se ve igual en todas partes.

const NEGRO = '#1a1a18';
const CREMA = '#F1EFE8';
const AMBAR = '#E8A33D';
const GRIS = '#8A8985';

function envoltura({ titulo, cuerpo }) {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:${NEGRO};font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NEGRO};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#211F1D;border:1px solid #3A3835;border-radius:10px;overflow:hidden;">
            <tr><td style="height:5px;background:${AMBAR};"></td></tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0;color:${CREMA};font-size:20px;font-weight:bold;letter-spacing:1px;">SIGTM</p>
                <p style="margin:2px 0 0 0;color:${GRIS};font-size:11px;letter-spacing:1px;">MOTO NEXUS &middot; GESTION DE TALLERES</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 30px 32px;">
                <h1 style="margin:0 0 14px 0;color:${CREMA};font-size:17px;">${titulo}</h1>
                ${cuerpo}
              </td>
            </tr>
          </table>
          <p style="max-width:520px;margin:16px auto 0 auto;color:${GRIS};font-size:11px;text-align:center;">
            Este mensaje se envio automaticamente. No respondas a esta direccion.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function boton(enlace, texto) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;">
    <tr><td style="background:${AMBAR};border-radius:6px;">
      <a href="${enlace}" style="display:inline-block;padding:12px 26px;color:${NEGRO};font-size:14px;font-weight:bold;text-decoration:none;">${texto}</a>
    </td></tr>
  </table>`;
}

function parrafo(texto) {
  return `<p style="margin:0 0 12px 0;color:${CREMA};font-size:14px;line-height:1.6;">${texto}</p>`;
}

function nota(texto) {
  return `<p style="margin:14px 0 0 0;color:${GRIS};font-size:12px;line-height:1.6;">${texto}</p>`;
}

function recuperacionPassword({ nombre, enlace, minutos }) {
  return {
    asunto: 'Restablece tu contrasena - SIGTM',
    html: envoltura({
      titulo: 'Restablecer la contrasena',
      cuerpo:
        parrafo(`Hola ${nombre},`) +
        parrafo('Alguien pidio restablecer la contrasena de esta cuenta. Si fuiste tu, usa el boton:') +
        boton(enlace, 'Crear una contrasena nueva') +
        nota(`El enlace sirve una sola vez y caduca en ${minutos} minutos.`) +
        nota('Si no pediste esto, no tienes que hacer nada: tu contrasena actual sigue funcionando.') +
        nota(`Si el boton no funciona, copia esta direccion en el navegador:<br><span style="color:${AMBAR};word-break:break-all;">${enlace}</span>`),
    }),
    texto:
      `Hola ${nombre}.\n\n` +
      `Para restablecer tu contrasena entra en:\n${enlace}\n\n` +
      `El enlace sirve una sola vez y caduca en ${minutos} minutos.\n` +
      `Si no pediste esto, ignora el mensaje.`,
  };
}

function verificacionEmail({ nombre, enlace }) {
  return {
    asunto: 'Confirma tu correo - SIGTM',
    html: envoltura({
      titulo: 'Confirma tu correo',
      cuerpo:
        parrafo(`Hola ${nombre}, bienvenido a SIGTM.`) +
        parrafo('Confirma que este correo es tuyo para poder recibir los avisos del estado de tu motocicleta:') +
        boton(enlace, 'Confirmar mi correo') +
        nota('Si no creaste ninguna cuenta, puedes ignorar este mensaje.'),
    }),
    texto: `Hola ${nombre}.\n\nConfirma tu correo entrando en:\n${enlace}`,
  };
}

function cambioEstadoOrden({ nombre, codigo, moto, paso, descripcion, enlace }) {
  const deMoto = moto ? ` (${moto})` : '';
  return {
    asunto: `${paso} - orden ${codigo} - SIGTM`,
    html: envoltura({
      titulo: paso,
      cuerpo:
        parrafo(`Hola ${nombre},`) +
        parrafo(
          `Tu orden <strong style="color:${AMBAR};">${codigo}</strong>${deMoto} cambio de etapa.`
        ) +
        parrafo(descripcion) +
        boton(enlace, 'Ver el estado de mi moto') +
        nota('No necesitas cuenta ni contrasena: el enlace lleva tu codigo de orden.'),
    }),
    texto:
      `Hola ${nombre}.\n\nTu orden ${codigo}${deMoto}: ${paso}.\n${descripcion}\n\n` +
      `Consulta el avance en:\n${enlace}`,
  };
}

function ordenCancelada({ nombre, codigo, moto, motivo, enlace }) {
  const deMoto = moto ? ` (${moto})` : '';
  return {
    asunto: `Orden ${codigo} cancelada - SIGTM`,
    html: envoltura({
      titulo: 'Se cancelo la orden',
      cuerpo:
        parrafo(`Hola ${nombre},`) +
        parrafo(`La orden <strong style="color:${AMBAR};">${codigo}</strong>${deMoto} se cancelo.`) +
        (motivo ? parrafo(`Motivo registrado: ${motivo}`) : '') +
        boton(enlace, 'Ver el detalle') +
        nota('Si esto no es lo que esperabas, comunicate con el taller.'),
    }),
    texto:
      `Hola ${nombre}.\n\nLa orden ${codigo}${deMoto} se cancelo.` +
      (motivo ? `\nMotivo: ${motivo}` : '') +
      `\n\nDetalle en:\n${enlace}`,
  };
}

module.exports = { recuperacionPassword, verificacionEmail, cambioEstadoOrden, ordenCancelada };
