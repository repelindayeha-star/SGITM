// Lista los endpoints que el servidor monta de verdad.
//
// No adivina leyendo el codigo con expresiones regulares: carga cada router
// y recorre su tabla de rutas. Asi el inventario del documento de
// arquitectura se puede contrastar contra lo que existe, no contra lo que
// alguien recuerda haber escrito.
//
//   node herramientas/listar-endpoints.js
//   node herramientas/listar-endpoints.js --csv > endpoints.csv
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const CSV = process.argv.includes('--csv');

// Se lee de app.js que router va montado en que prefijo, para no mantener
// esta lista a mano y que se desincronice.
const appJs = fs.readFileSync(path.join(RAIZ, 'src/app.js'), 'utf8');
const montajes = [...appJs.matchAll(/app\.use\(\s*'([^']+)'\s*,\s*require\('([^']+)'\)\s*\)/g)].map(
  (m) => ({ prefijo: m[1], modulo: m[2] })
);

const rutas = [];

// Endpoints declarados directamente sobre la aplicacion (el chequeo de salud).
for (const m of appJs.matchAll(/app\.(get|post|put|patch|delete)\(\s*'([^']+)'/g)) {
  rutas.push({ metodo: m[1].toUpperCase(), ruta: m[2], grupo: 'aplicacion' });
}

for (const { prefijo, modulo } of montajes) {
  const router = require(path.join(RAIZ, 'src', modulo.replace(/^\.\//, '')));
  for (const capa of router.stack) {
    if (!capa.route) continue;
    const metodos = Object.keys(capa.route.methods)
      .filter((x) => x !== '_all')
      .map((x) => x.toUpperCase());
    for (const metodo of metodos) {
      const cola = capa.route.path === '/' ? '' : capa.route.path;
      rutas.push({ metodo, ruta: prefijo + cola, grupo: prefijo });
    }
  }
}

const orden = { GET: 0, POST: 1, PUT: 2, PATCH: 3, DELETE: 4 };
rutas.sort(
  (a, b) => a.grupo.localeCompare(b.grupo) || a.ruta.localeCompare(b.ruta) || orden[a.metodo] - orden[b.metodo]
);

if (CSV) {
  console.log('metodo,ruta');
  for (const r of rutas) console.log(`${r.metodo},${r.ruta}`);
} else {
  let grupoActual = null;
  for (const r of rutas) {
    if (r.grupo !== grupoActual) {
      grupoActual = r.grupo;
      const cuantos = rutas.filter((x) => x.grupo === grupoActual).length;
      console.log(`\n${grupoActual}  (${cuantos})`);
    }
    console.log(`   ${r.metodo.padEnd(7)} ${r.ruta}`);
  }
  console.log(`\nTOTAL DE ENDPOINTS: ${rutas.length}`);
}
process.exit(0);
