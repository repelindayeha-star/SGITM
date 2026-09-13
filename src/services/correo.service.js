const nodemailer = require('nodemailer');
const env = require('../config/env');

// El transporte se crea una sola vez y se reutiliza. Abrir una conexion nueva
// por cada correo es lento y algunos proveedores lo penalizan.
let transportePrometido = null;

async function construirTransporte() {
  if (env.smtp.configurado) {
    const transporte = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.puerto,
      // 465 es TLS directo; 587 empieza en claro y sube a TLS con STARTTLS.
      secure: env.smtp.puerto === 465,
      auth: { user: env.smtp.usuario, pass: env.smtp.password },
    });
    return { transporte, esPrueba: false };
  }

  // Sin proveedor configurado se usa Ethereal: una bandeja de mentira que
  // NO entrega nada al destinatario real. A cambio devuelve una direccion
  // donde se puede abrir el correo tal como habria llegado, asi que sirve
  // para desarrollar y para ensayar la demostracion. Para la entrega de
  // verdad hay que configurar SMTP_HOST.
  const cuenta = await nodemailer.createTestAccount();
  const transporte = nodemailer.createTransport({
    host: cuenta.smtp.host,
    port: cuenta.smtp.port,
    secure: cuenta.smtp.secure,
    auth: { user: cuenta.user, pass: cuenta.pass },
  });
  console.warn(
    '\n[correo] No hay SMTP_HOST configurado: se usa una bandeja de prueba.\n' +
      '         Los correos NO llegan al destinatario; se imprime un enlace\n' +
      '         para verlos. Configura SMTP_HOST en .env antes de la entrega.\n'
  );
  return { transporte, esPrueba: true };
}

function obtenerTransporte() {
  if (!transportePrometido) {
    transportePrometido = construirTransporte();
  }
  return transportePrometido;
}

/**
 * Envia un correo. Nunca lanza hacia arriba.
 *
 * Es deliberado: que el servidor de correo este caido no puede tumbar la
 * peticion que lo disparo. Si no se puede avisar a un cliente de que su moto
 * esta lista, la orden igual debe quedar guardada. El fallo se registra en la
 * consola y la funcion devuelve si se logro enviar o no.
 */
async function enviar({ para, asunto, html, texto }) {
  try {
    const { transporte, esPrueba } = await obtenerTransporte();

    const info = await transporte.sendMail({
      from: env.smtp.remitente,
      to: para,
      subject: asunto,
      text: texto,
      html,
    });

    if (esPrueba) {
      const vista = nodemailer.getTestMessageUrl(info);
      console.log(`[correo] "${asunto}" -> ${para}`);
      console.log(`[correo] Verlo aqui: ${vista}`);
    } else {
      console.log(`[correo] Enviado "${asunto}" a ${para} (${info.messageId})`);
    }

    return { enviado: true };
  } catch (error) {
    console.error(`[correo] No se pudo enviar "${asunto}" a ${para}: ${error.message}`);
    return { enviado: false, error: error.message };
  }
}

// Comprobacion de arranque: dice si el proveedor responde, sin mandar nada.
async function verificarConexion() {
  try {
    const { transporte, esPrueba } = await obtenerTransporte();
    await transporte.verify();
    return { ok: true, esPrueba };
  } catch (error) {
    return { ok: false, esPrueba: !env.smtp.configurado, error: error.message };
  }
}

module.exports = { enviar, verificarConexion };
