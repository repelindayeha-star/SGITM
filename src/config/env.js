// Punto unico de verdad para la configuracion del sistema.
//
// Se carga ANTES que cualquier otra cosa (ver server.js) y aborta el arranque
// si falta una variable obligatoria. Es preferible no arrancar a arrancar mal
// configurado: antes, si faltaba FRONTEND_URL el CORS se abria a '*' en
// silencio y nadie se enteraba hasta que era tarde.
require('dotenv').config();

const esProduccion = process.env.NODE_ENV === 'production';

// [nombre, obligatoria siempre, obligatoria solo en produccion]
const REQUERIDAS = [
  ['DATABASE_URL', true, false],
  ['JWT_SECRET', true, false],
  ['FRONTEND_URL', false, true],
  ['RECAPTCHA_SECRET_KEY', false, true],
];

const faltantes = REQUERIDAS.filter(([nombre, siempre, soloProd]) => {
  const vacia = !process.env[nombre];
  return vacia && (siempre || (soloProd && esProduccion));
}).map(([nombre]) => nombre);

if (faltantes.length > 0) {
  console.error('\n[configuracion] Faltan variables de entorno obligatorias:');
  faltantes.forEach((nombre) => console.error(`   - ${nombre}`));
  console.error('\nCopia .env.example como .env y completa los valores.\n');
  process.exit(1);
}

// Un secreto corto convierte la firma del JWT en algo adivinable.
if (esProduccion && process.env.JWT_SECRET.length < 32) {
  console.error('\n[configuracion] JWT_SECRET debe tener al menos 32 caracteres en produccion.');
  console.error('Genera uno con:');
  console.error('   node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"\n');
  process.exit(1);
}

const env = {
  entorno: process.env.NODE_ENV || 'development',
  esProduccion,
  puerto: Number(process.env.PORT) || 3001,

  // En desarrollo asumimos el puerto por defecto de Vite.
  urlFrontend: process.env.FRONTEND_URL || 'http://localhost:5173',

  jwt: {
    secreto: process.env.JWT_SECRET,
    expiracion: process.env.JWT_EXPIRES_IN || '8h',
  },

  recaptcha: {
    secreto: process.env.RECAPTCHA_SECRET_KEY,
  },

  // El correo no es obligatorio para arrancar: sin proveedor configurado el
  // sistema cae a una bandeja de prueba y avisa por consola. Lo que no puede
  // pasar es que parezca configurado sin estarlo, de ahi el indicador.
  smtp: {
    configurado: Boolean(process.env.SMTP_HOST),
    host: process.env.SMTP_HOST,
    puerto: Number(process.env.SMTP_PORT) || 587,
    usuario: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    remitente: process.env.SMTP_FROM || 'SIGTM Moto Nexus <no-responder@sigtm.com>',
  },
};

module.exports = env;
