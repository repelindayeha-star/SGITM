const AppError = require('../utils/AppError');

const GOOGLE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const TOKEN_PRUEBA_DESARROLLO = 'test-bypass-sigtm';

async function verificarCaptcha(token) {
  if (!token) {
    throw new AppError('El captcha es obligatorio.', 400);
  }

  // Bypass exclusivo para pruebas locales con Thunder Client / Postman,
  // mientras no existe el frontend con el checkbox real de reCAPTCHA.
  if (process.env.NODE_ENV !== 'production' && token === TOKEN_PRUEBA_DESARROLLO) {
    return true;
  }

  const params = new URLSearchParams();
  params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
  params.append('response', token);

  const respuesta = await fetch(GOOGLE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await respuesta.json();

  if (!data.success) {
    throw new AppError('Verificación de captcha fallida. Intenta de nuevo.', 400);
  }

  return true;
}

module.exports = { verificarCaptcha };  