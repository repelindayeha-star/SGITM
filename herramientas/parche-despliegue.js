// Deja el proyecto listo para desplegar.
//
//  - CORS acepta VARIOS origenes. Hasta ahora aceptaba uno solo, asi que al
//    tener la direccion de Vercel y ademas el dominio propio, uno de los dos
//    quedaria fuera y el navegador bloquearia todas las peticiones.
//  - package.json: version de Node fijada y prisma generate al instalar.
//  - render.yaml con la configuracion del servicio.

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const leer = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');
const guardar = (p, t) => fs.writeFileSync(path.join(RAIZ, p), t, 'utf8');

// ============================================================== 1. CORS
{
  const P = 'src/config/env.js';
  let t = leer(P);
  if (t.includes('origenesPermitidos')) {
    console.log('1a. env.js: ya estaba');
  } else {
    const viejo = "  urlFrontend: process.env.FRONTEND_URL || 'http://localhost:5173',";
    if (!t.includes(viejo)) {
      console.error('ERROR: no encontre urlFrontend en env.js');
      process.exit(1);
    }
    const nuevo = `  urlFrontend: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim(),

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
    .filter(Boolean),`;
    guardar(P, t.replace(viejo, nuevo));
    console.log('1a. env.js: acepta varios origenes');
  }
}

{
  const P = 'src/app.js';
  let t = leer(P);
  if (t.includes('origenesPermitidos')) {
    console.log('1b. app.js: ya estaba');
  } else {
    const viejo = 'app.use(cors({ origin: env.urlFrontend, credentials: true }));';
    if (!t.includes(viejo)) {
      console.error('ERROR: no encontre la linea de cors en app.js');
      process.exit(1);
    }
    const nuevo = `// Se comprueba el origen contra la lista en vez de pasar un solo valor.
//
// Las peticiones sin origen (curl, las pruebas de integracion, los chequeos
// de salud del alojamiento) se dejan pasar: no vienen de un navegador, asi
// que el CORS no las protege de nada y bloquearlas solo romperia el monitoreo.
app.use(
  cors({
    origin(origen, callback) {
      if (!origen) return callback(null, true);
      if (env.origenesPermitidos.includes(origen)) return callback(null, true);
      return callback(new Error(\`Origen no permitido: \${origen}\`));
    },
    credentials: true,
  })
);`;
    guardar(P, t.replace(viejo, nuevo));
    console.log('1b. app.js: comprueba contra la lista');
  }
}

// ======================================================= 2. package.json
{
  const P = 'package.json';
  const pkg = JSON.parse(leer(P));
  let cambio = false;

  if (!pkg.engines) {
    // Se fija la version mayor de Node. Sin esto el alojamiento elige la que
    // quiera, y una distinta de la del equipo es de los fallos mas dificiles
    // de diagnosticar: compila bien en local y revienta en produccion.
    pkg.engines = { node: '>=20 <23' };
    cambio = true;
  }
  if (!pkg.scripts.postinstall) {
    // Prisma necesita generar su cliente despues de instalar. Sin esto el
    // servidor arranca y falla en la primera consulta.
    pkg.scripts.postinstall = 'prisma generate';
    cambio = true;
  }
  if (!pkg.scripts['migrar:produccion']) {
    pkg.scripts['migrar:produccion'] = 'prisma migrate deploy';
    cambio = true;
  }
  if (cambio) {
    guardar(P, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log('2. package.json: engines, postinstall y migrar:produccion');
  } else {
    console.log('2. package.json: ya estaba');
  }
}

// ========================================================== 3. render.yaml
{
  const P = 'render.yaml';
  if (fs.existsSync(path.join(RAIZ, P))) {
    console.log('3. render.yaml: ya estaba');
  } else {
    const yaml = `# Configuracion del servicio en Render.
#
# La base de datos NO se declara aqui a proposito: seguimos usando Neon. La
# base gratuita de Render caduca a los 30 dias y borra los datos, asi que
# apuntar el proyecto a ella seria perderlo todo un mes despues.
#
# Las variables marcadas sync:false se escriben a mano en el panel de Render.
# No van en el repositorio porque son secretos.
services:
  - type: web
    name: sigtm-api
    runtime: node
    plan: free
    region: oregon
    branch: main
    buildCommand: npm install && npx prisma migrate deploy
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_EXPIRES_IN
        value: 8h
      - key: FRONTEND_URL
        sync: false
      - key: RECAPTCHA_SECRET_KEY
        sync: false
      - key: SMTP_HOST
        value: smtp-relay.brevo.com
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: SMTP_FROM
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
`;
    guardar(P, yaml);
    console.log('3. render.yaml creado');
  }
}

// ========================================================== comprobacion
console.log('');
console.log('=== COMPROBACION ===');
delete require.cache[require.resolve(path.join(RAIZ, 'src/config/env.js'))];
const env = require(path.join(RAIZ, 'src/config/env.js'));
console.log(`  origenes permitidos : ${JSON.stringify(env.origenesPermitidos)}`);
console.log(`  urlFrontend (correos): ${env.urlFrontend}`);
require(path.join(RAIZ, 'src/app.js'));
console.log('  el servidor carga   : si');
