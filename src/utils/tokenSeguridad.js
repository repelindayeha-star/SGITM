const crypto = require('crypto');

// Lo que viaja en el correo y lo que se guarda en la base NO son lo mismo.
//
// Se genera un valor aleatorio de 32 bytes: ese es el que va en el enlace.
// En la tabla solo queda su huella SHA-256. Si alguien consiguiera leer la
// tabla de tokens no podria construir ningun enlace, porque del hash no se
// vuelve al original. Es el mismo razonamiento que con las contrasenas.
function generarToken() {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, tokenHash: hashear(token) };
}

function hashear(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Minutos de vida de cada tipo de token.
const CADUCIDAD_MINUTOS = {
  RECUPERACION_PASSWORD: 30,
  VERIFICACION_EMAIL: 60 * 24,
};

function calcularExpiracion(tipo) {
  const minutos = CADUCIDAD_MINUTOS[tipo];
  if (!minutos) {
    throw new Error(`Tipo de token desconocido: ${tipo}`);
  }
  return new Date(Date.now() + minutos * 60 * 1000);
}

module.exports = { generarToken, hashear, calcularExpiracion, CADUCIDAD_MINUTOS };
