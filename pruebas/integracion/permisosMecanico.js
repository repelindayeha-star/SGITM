// Un mecanico solo trabaja las ordenes que le asignaron.
//
// Importa: antes bastaba con tener sesion de mecanico. Cambiando el UUID de
// la URL se podia abrir la orden de un companero, cambiarle el estado o
// subirle fotos -- y el historial quedaba firmado con el nombre equivocado.
// Es autorizacion horizontal: el rol era correcto, el dueno no.
//
// Corre contra la base real porque lo que se comprueba es precisamente que
// los datos de dos personas no se crucen.

require('dotenv').config({ quiet: true });
const prisma = require('../../src/config/prismaClient');
const ordenService = require('../../src/services/ordenTrabajo.service');
const {
  soloOrdenAsignadaSiMecanico,
  soloMiListaSiMecanico,
} = require('../../src/middlewares/propiedad.middleware');

let ok = 0;
let mal = 0;
function comprobar(que, condicion, detalle = '') {
  if (condicion) {
    ok += 1;
    console.log(`  OK    ${que}`);
  } else {
    mal += 1;
    console.log(`  FALLA ${que}${detalle ? ` -> ${detalle}` : ''}`);
  }
}

// Ejecuta un middleware y devuelve el error que produjo, o null si dejo pasar.
function correr(mw, req) {
  return new Promise((resolver) => mw(req, {}, (e) => resolver(e || null)));
}

(async () => {
  console.log('=== PERMISOS ENTRE MECANICOS ===\n');

  const [m1, m2] = await prisma.usuario.findMany({
    where: { rol: 'MECANICO' },
    orderBy: { email: 'asc' },
    select: { id: true, nombre: true },
  });
  const recepcion = await prisma.usuario.findFirst({ where: { rol: 'RECEPCIONISTA' } });

  if (!m1 || !m2 || !recepcion) {
    console.log('  Faltan cuentas de prueba. Corre la semilla antes.');
    process.exit(1);
  }

  const ordenDeM1 = await prisma.ordenTrabajo.findFirst({ where: { mecanicoId: m1.id } });
  const ordenDeM2 = await prisma.ordenTrabajo.findFirst({ where: { mecanicoId: m2.id } });

  if (!ordenDeM1 || !ordenDeM2) {
    console.log('  Cada mecanico necesita al menos una orden asignada. Corre la semilla.');
    process.exit(1);
  }

  console.log('-- El listado --');
  const listaM1 = await ordenService.listar({ rol: 'MECANICO', id: m1.id });
  const listaM2 = await ordenService.listar({ rol: 'MECANICO', id: m2.id });
  const listaRecepcion = await ordenService.listar({ rol: 'RECEPCIONISTA', id: recepcion.id });

  comprobar('el mecanico solo ve las ordenes que le asignaron',
    listaM1.length > 0 && listaM1.every((o) => o.mecanicoId === m1.id));
  comprobar('el otro mecanico ve las suyas, no las del primero',
    listaM2.length > 0 && listaM2.every((o) => o.mecanicoId === m2.id));
  comprobar('recepcion sigue viendo todas',
    listaRecepcion.length >= listaM1.length + listaM2.length);

  console.log('\n-- Abrir o modificar una orden ajena --');
  const porUrl = soloOrdenAsignadaSiMecanico();

  let e = await correr(porUrl, { usuario: { rol: 'MECANICO', id: m1.id }, params: { id: ordenDeM2.id } });
  comprobar('abrir la orden de un companero se rechaza con 403', e && e.statusCode === 403);

  e = await correr(porUrl, { usuario: { rol: 'MECANICO', id: m1.id }, params: { id: ordenDeM1.id } });
  comprobar('la suya si la puede abrir', e === null, e ? `${e.statusCode} ${e.message}` : '');

  e = await correr(porUrl, { usuario: { rol: 'RECEPCIONISTA', id: recepcion.id }, params: { id: ordenDeM2.id } });
  comprobar('recepcion no queda restringida', e === null);

  e = await correr(porUrl, {
    usuario: { rol: 'MECANICO', id: m1.id },
    params: { id: '00000000-0000-0000-0000-000000000000' },
  });
  comprobar('una orden inexistente responde igual que una ajena', e && e.statusCode === 403);

  console.log('\n-- La lista de otro mecanico por la URL --');
  e = await correr(soloMiListaSiMecanico, { usuario: { rol: 'MECANICO', id: m1.id }, params: { mecanicoId: m2.id } });
  comprobar('pedir la carga de trabajo de un companero se rechaza', e && e.statusCode === 403);

  e = await correr(soloMiListaSiMecanico, { usuario: { rol: 'MECANICO', id: m1.id }, params: { mecanicoId: m1.id } });
  comprobar('la propia si se puede pedir', e === null);

  console.log(`\n=== ${ok} en verde, ${mal} en rojo ===`);
  process.exit(mal === 0 ? 0 : 1);
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
