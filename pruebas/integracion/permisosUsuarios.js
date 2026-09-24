// Quien puede dar de alta personal (mecanicos, recepcionistas, administradores).
//
// Crear personal es gobierno del sistema: quien crea cuentas decide quien
// entra y con que rol. Por eso POST /api/usuarios es exclusivo del
// ADMINISTRADOR, y ademas el servicio se niega a crear CLIENTES desde ahi
// (un cliente nace con su perfil, desde el modulo de clientes).

require('dotenv').config({ quiet: true });
const autorizarRoles = require('../../src/middlewares/roles.middleware');
const usuarioService = require('../../src/services/usuario.service');

let ok = 0;
let mal = 0;
function comprobar(que, condicion, detalle = '') {
  if (condicion) { ok += 1; console.log(`  OK    ${que}`); }
  else { mal += 1; console.log(`  FALLA ${que}${detalle ? ` -> ${detalle}` : ''}`); }
}

const guard = autorizarRoles('ADMINISTRADOR'); // el mismo de POST /api/usuarios
const correr = (mw, req) => new Promise((r) => mw(req, {}, (e) => r(e || null)));

(async () => {
  console.log('=== PERMISOS PARA CREAR PERSONAL ===\n');

  const admin = await correr(guard, { usuario: { rol: 'ADMINISTRADOR' } });
  comprobar('el ADMINISTRADOR puede crear personal', admin === null);

  for (const rol of ['RECEPCIONISTA', 'MECANICO', 'CLIENTE']) {
    const err = await correr(guard, { usuario: { rol } });
    comprobar(`el ${rol} NO puede crear personal (403)`, err !== null && err.statusCode === 403, err && err.message);
  }

  const sin = await correr(guard, {});
  comprobar('sin sesion no se puede crear personal (401)', sin !== null && sin.statusCode === 401);

  console.log('\n=== QUE ROLES ADMITE EL FORMULARIO ===');
  try {
    await usuarioService.crear({ nombre: 'Prueba', email: `no-crear-${Date.now()}@x.com`, password: '12345678', rol: 'CLIENTE' });
    comprobar('crear un CLIENTE desde personal queda rechazado', false, 'se creo el usuario');
  } catch (e) {
    comprobar('crear un CLIENTE desde personal queda rechazado', e.statusCode === 400, e.message);
  }

  console.log(`\nResultado: ${ok} bien, ${mal} mal`);
  process.exit(mal === 0 ? 0 : 1);
})();
