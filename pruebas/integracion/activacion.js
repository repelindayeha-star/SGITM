// Prueba de integracion del alta de clientes con codigo.
//
// Recorre el flujo entero contra la base real: la recepcionista registra, el
// cliente recibe un codigo, se equivoca, se le agotan los intentos, pide otro,
// acierta y entra con SU contrasena.
//
// Como se obtiene el codigo para la prueba: en la base solo esta su huella,
// asi que se recorre el millon de combinaciones hasta dar con la que coincide.
// Tarda un segundo y de paso demuestra dos cosas: que la huella es correcta, y
// que quien NO tiene acceso a la base no puede hacer esto — para el, la unica
// via es probar contra la API, y ahi se topa con los cinco intentos.
//
// Al final borra todo lo que creo: la base es compartida.

require('dotenv').config();
const prisma = require('../../src/config/prismaClient');
const { hashearCodigo, MAX_INTENTOS } = require('../../src/utils/codigoSeguridad');

const API = 'http://localhost:3001/api';
const CAPTCHA = 'test-bypass-sigtm';
const SELLO = Date.now();
const CORREO = `prueba.activacion.${SELLO}@ejemplo.com`;
const CLAVE_NUEVA = 'MiClaveSegura9';

let ok = 0;
let mal = 0;
const creados = [];

function comprobar(descripcion, condicion, detalle = '') {
  if (condicion) {
    ok += 1;
    console.log(`  OK    ${descripcion}`);
  } else {
    mal += 1;
    console.log(`  FALLA ${descripcion}${detalle ? ` -> ${detalle}` : ''}`);
  }
}

async function pedir(ruta, opciones = {}) {
  const r = await fetch(`${API}${ruta}`, {
    method: opciones.metodo || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opciones.token ? { Authorization: `Bearer ${opciones.token}` } : {}),
    },
    body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined,
  });
  let datos = null;
  try {
    datos = await r.json();
  } catch {
    datos = null;
  }
  return { estado: r.status, datos };
}

// Recupera el codigo a partir de su huella, recorriendo las combinaciones.
function descubrirCodigo(usuarioId, huella) {
  for (let n = 0; n < 1000000; n += 1) {
    const candidato = String(n).padStart(6, '0');
    if (hashearCodigo(usuarioId, candidato) === huella) return candidato;
  }
  return null;
}

async function codigoVivoDe(email) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return null;
  const fila = await prisma.tokenSeguridad.findFirst({
    where: { usuarioId: usuario.id, usadoEn: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!fila) return null;
  return { usuario, fila, codigo: descubrirCodigo(usuario.id, fila.tokenHash) };
}

(async () => {
  console.log('=== ALTA DE CLIENTE CON CODIGO ===\n');

  // ---- La recepcionista entra ----
  const login = await pedir('/auth/login', {
    metodo: 'POST',
    cuerpo: { email: 'recepcion@sigtm.com', password: 'Sigtm2026*', captchaToken: CAPTCHA },
  });
  comprobar('la recepcionista entra', login.estado === 200);
  const tokenRecepcion = login.datos?.data?.token;
  if (!tokenRecepcion) {
    console.log('\nSin sesion de recepcion no se puede seguir.');
    process.exit(1);
  }

  // ---- 1. Registrar sin contrasena ----
  console.log('\n-- 1. La recepcionista registra al cliente --');
  const alta = await pedir('/clientes', {
    metodo: 'POST',
    token: tokenRecepcion,
    cuerpo: { nombre: 'Cliente De Prueba', email: CORREO, telefono: '3001234567' },
  });
  comprobar('se crea el cliente', alta.estado === 201, `estado ${alta.estado}`);
  // Se busca una huella de bcrypt de verdad ($2a$ / $2b$), no la palabra
  // "password": el usuario trae un campo passwordCambiadaEn que es una fecha,
  // y buscar la palabra suelta daria un falso positivo.
  const cuerpoAlta = JSON.stringify(alta.datos || {});
  comprobar(
    'la respuesta NO devuelve la huella de ninguna contrasena',
    !/\$2[aby]?\$\d{2}\$/.test(cuerpoAlta)
  );
  comprobar(
    'la respuesta NO trae el campo password',
    !/"password"\s*:/.test(cuerpoAlta)
  );
  if (alta.estado === 201) creados.push(CORREO);

  // ---- 2. No se puede entrar todavia ----
  console.log('\n-- 2. Antes de activar, nadie entra --');
  const intentoClave = await pedir('/auth/login', {
    metodo: 'POST',
    cuerpo: { email: CORREO, password: CLAVE_NUEVA, captchaToken: CAPTCHA },
  });
  comprobar('la cuenta nace cerrada', intentoClave.estado === 401, `estado ${intentoClave.estado}`);

  const antes = await prisma.usuario.findUnique({ where: { email: CORREO } });
  comprobar('el correo empieza sin verificar', antes && antes.emailVerificado === false);

  // ---- 3. Se creo un codigo ----
  console.log('\n-- 3. El codigo que le llego al cliente --');
  const primero = await codigoVivoDe(CORREO);
  comprobar('existe un codigo vivo', !!primero?.codigo);
  comprobar('son seis digitos', /^[0-9]{6}$/.test(primero?.codigo || ''));
  comprobar('en la base NO esta el codigo, solo su huella', primero?.fila.tokenHash !== primero?.codigo);

  // ---- 4. Equivocarse cuesta ----
  console.log('\n-- 4. Equivocarse gasta intentos --');
  const equivocado = primero.codigo === '000000' ? '999999' : '000000';
  for (let i = 1; i <= MAX_INTENTOS; i += 1) {
    await pedir('/auth/activar/confirmar', {
      metodo: 'POST',
      cuerpo: { email: CORREO, codigo: equivocado, password: CLAVE_NUEVA, confirmacion: CLAVE_NUEVA },
    });
  }
  const tras = await prisma.tokenSeguridad.findUnique({ where: { id: primero.fila.id } });
  comprobar(`tras ${MAX_INTENTOS} fallos el codigo queda muerto`, tras.usadoEn !== null);

  const conElBueno = await pedir('/auth/activar/confirmar', {
    metodo: 'POST',
    cuerpo: { email: CORREO, codigo: primero.codigo, password: CLAVE_NUEVA, confirmacion: CLAVE_NUEVA },
  });
  comprobar('ni el codigo correcto sirve ya', conElBueno.estado === 400);

  // ---- 5. Pedir otro ----
  console.log('\n-- 5. Pedir un codigo nuevo --');
  const reenvio = await pedir('/auth/activar/solicitar', { metodo: 'POST', cuerpo: { email: CORREO } });
  comprobar('se puede pedir otro', reenvio.estado === 200);

  const inventado = await pedir('/auth/activar/solicitar', {
    metodo: 'POST',
    cuerpo: { email: `nadie.${SELLO}@ejemplo.com` },
  });
  comprobar(
    'un correo que no existe responde igual (no revela quien tiene cuenta)',
    inventado.estado === 200 && inventado.datos?.mensaje === reenvio.datos?.mensaje
  );

  // ---- 6. Activar de verdad ----
  console.log('\n-- 6. El cliente activa y elige SU contrasena --');
  const segundo = await codigoVivoDe(CORREO);
  comprobar('hay un codigo nuevo', !!segundo?.codigo);
  comprobar('es distinto del anterior', segundo?.codigo !== primero?.codigo);

  const debil = await pedir('/auth/activar/confirmar', {
    metodo: 'POST',
    cuerpo: { email: CORREO, codigo: segundo.codigo, password: 'aaaaaaaa', confirmacion: 'aaaaaaaa' },
  });
  comprobar('rechaza una contrasena sin numeros', debil.estado === 400);

  const distintas = await pedir('/auth/activar/confirmar', {
    metodo: 'POST',
    cuerpo: { email: CORREO, codigo: segundo.codigo, password: CLAVE_NUEVA, confirmacion: 'OtraCosa9' },
  });
  comprobar('rechaza si las dos contrasenas no coinciden', distintas.estado === 400);

  const activar = await pedir('/auth/activar/confirmar', {
    metodo: 'POST',
    cuerpo: { email: CORREO, codigo: segundo.codigo, password: CLAVE_NUEVA, confirmacion: CLAVE_NUEVA },
  });
  comprobar('activa con el codigo correcto', activar.estado === 200, JSON.stringify(activar.datos));

  // ---- 7. Ahora si entra ----
  console.log('\n-- 7. Resultado --');
  const entra = await pedir('/auth/login', {
    metodo: 'POST',
    cuerpo: { email: CORREO, password: CLAVE_NUEVA, captchaToken: CAPTCHA },
  });
  comprobar('el cliente entra con SU contrasena', entra.estado === 200, `estado ${entra.estado}`);
  comprobar('y entra como CLIENTE', entra.datos?.data?.usuario?.rol === 'CLIENTE');

  const despues = await prisma.usuario.findUnique({ where: { email: CORREO } });
  comprobar('el correo quedo verificado de verdad', despues?.emailVerificado === true);

  const reusar = await pedir('/auth/activar/confirmar', {
    metodo: 'POST',
    cuerpo: { email: CORREO, codigo: segundo.codigo, password: 'OtraClave9', confirmacion: 'OtraClave9' },
  });
  comprobar('el codigo usado no vale una segunda vez', reusar.estado === 400);

  const vivos = await prisma.tokenSeguridad.count({
    where: { usuarioId: despues.id, usadoEn: null },
  });
  comprobar('no quedan codigos vivos de esa cuenta', vivos === 0, `quedan ${vivos}`);

  // ---- Limpieza ----
  console.log('\n-- Limpieza --');
  for (const correo of creados) {
    const u = await prisma.usuario.findUnique({ where: { email: correo } });
    if (u) {
      await prisma.cliente.deleteMany({ where: { usuarioId: u.id } });
      await prisma.usuario.delete({ where: { id: u.id } });
      console.log(`  borrado ${correo}`);
    }
  }

  console.log(`\n=== ${ok} en verde, ${mal} en rojo ===`);
  await prisma.$disconnect();
  process.exit(mal === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('ERROR:', e.message);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
