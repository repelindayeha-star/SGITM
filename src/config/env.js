// Punto unico de verdad para la configuracion del sistema.
//
// Se carga ANTES que cualquier otra cosa (ver server.js) y aborta el arranque
// si falta una variable obligatoria. Es preferible no arrancar a arrancar mal
// configurado: antes, si faltaba FRONTEND_URL el CORS se abria a '*' en
// silencio y nadie se enteraba hasta que era tarde.
require('dotenv').config();

// Se limpian los valores antes de usarlos: se quitan los espacios de los
// extremos y las comillas que envuelvan todo el valor.
//
// No es paranoia. En un archivo .env se acostumbra escribir CLAVE="valor" y
// dotenv quita esas comillas al leerlo, asi que en local todo funciona. Los
// paneles de los alojamientos guardan el texto TAL CUAL se pega: si alguien
// copia el valor con sus comillas, o con un espacio o un tabulador delante,
// el valor guardado los incluye. El resultado son fallos que no parecen de
// configuracion: un servidor de correo que 'no existe', una carpeta de
// compilacion que no aparece, un remitente que el proveedor rechaza.
//
// Ningun valor real de esta lista empieza o termina con espacios ni con
// comillas, asi que quitarlos no puede romper nada y evita toda esa familia
// de errores de una sola vez.
const VARIABLES_DE_TEXTO = [
  'DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'FRONTEND_URL', 'API_URL',
  'RECAPTCHA_SECRET_KEY', 'BREVO_API_KEY',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
];

VARIABLES_DE_TEXTO.forEach((nombre) => {
  const bruto = process.env[nombre];
  if (typeof bruto !== 'string') return;
  const limpio = bruto.trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
  if (limpio !== bruto) {
    process.env[nombre] = limpio;
    console.warn(`[configuracion] ${nombre} traia espacios o comillas de sobra; se limpio.`);
  }
});

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
  urlFrontend: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim(),

  // Todos los origenes que pueden hablar con esta API.
  //
  // FRONTEND_URL admite varios separados por coma porque en produccion hay
  // al menos dos: la direccion que da Vercel y el dominio propio. Con un solo
  // origen permitido, el navegador bloquea al otro y la aplicacion parece
  // caida sin estarlo.
  //
  // El primero de la lista sigue siendo urlFrontend, que es el que se usa
  // para construir los enlaces de los correos.
  origenesPermitidos: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  jwt: {
    secreto: process.env.JWT_SECRET,
    expiracion: process.env.JWT_EXPIRES_IN || '8h',
  },

  recaptcha: {
    secreto: process.env.RECAPTCHA_SECRET_KEY,
  },

  // Direccion publica de esta API. Solo se usa para armar el enlace de las
  // imagenes cuando se guardan en disco (desarrollo sin Cloudinary).
  urlPublicaApi: process.env.API_URL || `http://localhost:${Number(process.env.PORT) || 3001}`,

  // Almacenamiento de las fotografias de evidencia.
  //
  // Sin configurar, las imagenes van al disco de este servidor. Sirve para
  // desarrollar, pero el disco de un servidor en la nube se borra en cada
  // despliegue: en produccion las tres variables son obligatorias.
  cloudinary: {
    configurado: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ),
    nombreNube: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // El correo no es obligatorio para arrancar: sin proveedor configurado el
  // sistema cae a una bandeja de prueba y avisa por consola. Lo que no puede
  // pasar es que parezca configurado sin estarlo, de ahi el indicador.
  // Envio por la API HTTP de Brevo.
  //
  // Es la via preferida en produccion porque viaja por HTTPS. El alojamiento
  // gratuito de Render no deja salir conexiones SMTP: el envio se queda
  // esperando hasta que caduca ('Connection timeout'), sin error de
  // autenticacion que de una pista. Las mismas credenciales funcionan desde
  // un computador de casa, lo que hace que el fallo parezca del programa.
  //
  // Si esta variable no esta, se sigue usando SMTP, que es lo comodo en local.
  brevo: {
    configurado: Boolean(process.env.BREVO_API_KEY),
    apiKey: process.env.BREVO_API_KEY,
  },

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
