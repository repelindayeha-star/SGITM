const nodemailer = require('nodemailer');
const env = require('../config/env');

// Envio de correo con tres vias, en este orden:
//
//   1. La API HTTP de Brevo, si hay BREVO_API_KEY.
//   2. SMTP, si hay SMTP_HOST.
//   3. Una bandeja de prueba que no entrega nada, si no hay ninguna de las dos.
//
// El orden no es capricho. El alojamiento gratuito donde corre esto no deja
// salir conexiones SMTP: el envio se queda esperando hasta que caduca y el
// registro solo dice 'Connection timeout'. Como las mismas credenciales
// funcionan perfectamente desde un computador de casa, el fallo parece del
// programa y se persigue por el lado equivocado. La API va por HTTPS, que es
// el unico camino que ningun alojamiento bloquea.
//
// SMTP se conserva porque en local es mas comodo y no obliga a cada quien a
// sacar su propia clave de API para trabajar.

const URL_API_BREVO = 'https://api.brevo.com/v3/smtp/email';
const ESPERA_MAXIMA_MS = 15000;

/**
 * Parte "Nombre <correo@dominio>" en las dos piezas que pide la API.
 * Si solo viene la direccion, el nombre queda vacio y Brevo usa el del remitente.
 */
function separarRemitente(texto) {
  const valor = (texto || '').trim();
  const conNombre = valor.match(/^(.*?)\s*<([^>]+)>$/);
  if (conNombre) {
    return { name: conNombre[1].trim() || undefined, email: conNombre[2].trim() };
  }
  return { email: valor };
}

async function enviarPorApi({ para, asunto, html, texto }) {
  const respuesta = await fetch(URL_API_BREVO, {
    method: 'POST',
    headers: {
      'api-key': env.brevo.apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: separarRemitente(env.smtp.remitente),
      to: [{ email: para }],
      subject: asunto,
      htmlContent: html,
      textContent: texto,
    }),
    // Sin limite de espera, una peticion colgada deja esperando a quien pidio
    // el codigo. Vale mas responder rapido y registrar el fallo.
    signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text().catch(() => '');
    throw new Error(`la API respondio ${respuesta.status} ${cuerpo.slice(0, 200)}`.trim());
  }

  const datos = await respuesta.json().catch(() => ({}));
  return datos.messageId || '(sin identificador)';
}

// ----------------------------------------------------------------- SMTP

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
  // verdad hay que configurar BREVO_API_KEY o SMTP_HOST.
  const cuenta = await nodemailer.createTestAccount();
  const transporte = nodemailer.createTransport({
    host: cuenta.smtp.host,
    port: cuenta.smtp.port,
    secure: cuenta.smtp.secure,
    auth: { user: cuenta.user, pass: cuenta.pass },
  });
  console.warn(
    '\n[correo] No hay proveedor configurado: se usa una bandeja de prueba.\n' +
      '         Los correos NO llegan al destinatario; se imprime un enlace\n' +
      '         para verlos. Configura BREVO_API_KEY antes de la entrega.\n'
  );
  return { transporte, esPrueba: true };
}

function obtenerTransporte() {
  if (!transportePrometido) {
    transportePrometido = construirTransporte();
  }
  return transportePrometido;
}

// ---------------------------------------------------------------- envio

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
    if (env.brevo.configurado) {
      const identificador = await enviarPorApi({ para, asunto, html, texto });
      console.log(`[correo] Enviado por API "${asunto}" a ${para} (${identificador})`);
      return { enviado: true };
    }

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
      console.log(`[correo] Enviado por SMTP "${asunto}" a ${para} (${info.messageId})`);
    }

    return { enviado: true };
  } catch (error) {
    console.error(`[correo] No se pudo enviar "${asunto}" a ${para}: ${error.message}`);
    return { enviado: false, error: error.message };
  }
}

// Comprobacion de arranque: dice si el proveedor responde, sin mandar nada.
async function verificarConexion() {
  if (env.brevo.configurado) {
    try {
      // /account solo lee los datos de la cuenta. Sirve para saber si la clave
      // vale sin gastar uno de los envios diarios del plan gratuito.
      const respuesta = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': env.brevo.apiKey, accept: 'application/json' },
        signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
      });
      if (!respuesta.ok) {
        return { ok: false, via: 'api', esPrueba: false, error: `la API respondio ${respuesta.status}` };
      }
      return { ok: true, via: 'api', esPrueba: false };
    } catch (error) {
      return { ok: false, via: 'api', esPrueba: false, error: error.message };
    }
  }

  try {
    const { transporte, esPrueba } = await obtenerTransporte();
    await transporte.verify();
    return { ok: true, via: esPrueba ? 'prueba' : 'smtp', esPrueba };
  } catch (error) {
    return { ok: false, via: 'smtp', esPrueba: !env.smtp.configurado, error: error.message };
  }
}

module.exports = { enviar, verificarConexion };
