// Quien puede bajarse el PDF de una factura.
//
// Importa: la ruta del PDF solo pedia sesion valida, y un comentario afirmaba
// que el control de dueno vivia en el servicio de facturas. No era cierto:
// facturaService.obtenerPorId ni siquiera recibe el usuario. Con el UUID a la
// mano, cualquier cuenta autenticada -- otro cliente, un mecanico -- se bajaba
// la factura ajena, con nombre, placa, direccion y lo que pago.
//
// Corre contra la base real porque lo que se comprueba es que los datos de
// dos personas no se crucen.

require('dotenv').config({ quiet: true });
const prisma = require('../../src/config/prismaClient');
const autorizarRoles = require('../../src/middlewares/roles.middleware');
const {
  soloPropioSiCliente,
  duenoDeFactura,
} = require('../../src/middlewares/propiedad.middleware');

let ok = 0;
let mal = 0;
function comprobar(que, condicion, detalle = '') {
  if (condicion) { ok += 1; console.log(`  OK    ${que}`); }
  else { mal += 1; console.log(`  FALLA ${que}${detalle ? ` -> ${detalle}` : ''}`); }
}

const correr = (mw, req) => new Promise((r) => mw(req, {}, (e) => r(e || null)));

// Los dos guardias de GET /api/reportes/facturas/:id.pdf, en orden.
const puertaDeRol = autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE');
const puertaDeDueno = soloPropioSiCliente(duenoDeFactura);

async function pasarLaPuerta(usuario, facturaId) {
  const req = { usuario, params: { id: facturaId } };
  return (await correr(puertaDeRol, req)) || (await correr(puertaDeDueno, req));
}

(async () => {
  console.log('=== PERMISOS DEL PDF DE FACTURA ===\n');

  const factura = await prisma.factura.findFirst({ include: { orden: true } });
  if (!factura) {
    console.log('  No hay facturas en la base; no hay nada que comprobar.');
    process.exit(0);
  }

  const dueno = await prisma.cliente.findUnique({
    where: { id: factura.orden.clienteId },
    include: { usuario: true },
  });
  const otro = await prisma.cliente.findFirst({
    where: { id: { not: factura.orden.clienteId } },
    include: { usuario: true },
  });
  const mecanico = await prisma.usuario.findFirst({ where: { rol: 'MECANICO' } });

  console.log(`  Factura de prueba: ${factura.numero} (cliente ${dueno.usuario.nombre})\n`);

  comprobar(
    'el ADMINISTRADOR puede bajar el PDF',
    (await pasarLaPuerta({ id: 'x', rol: 'ADMINISTRADOR' }, factura.id)) === null
  );
  comprobar(
    'la RECEPCIONISTA puede bajar el PDF',
    (await pasarLaPuerta({ id: 'x', rol: 'RECEPCIONISTA' }, factura.id)) === null
  );

  const suyo = await pasarLaPuerta({ id: dueno.usuario.id, rol: 'CLIENTE' }, factura.id);
  comprobar('el CLIENTE dueno puede bajar SU PDF', suyo === null, suyo && suyo.message);

  if (otro) {
    const ajeno = await pasarLaPuerta({ id: otro.usuario.id, rol: 'CLIENTE' }, factura.id);
    comprobar(
      'otro CLIENTE NO puede bajar esa factura (403)',
      ajeno !== null && ajeno.statusCode === 403,
      ajeno && ajeno.message
    );
  } else {
    console.log('  (solo hay un cliente en la base; no se puede probar el cruce)');
  }

  if (mecanico) {
    const mec = await pasarLaPuerta({ id: mecanico.id, rol: 'MECANICO' }, factura.id);
    comprobar(
      'el MECANICO NO puede bajar facturas (403)',
      mec !== null && mec.statusCode === 403,
      mec && mec.message
    );
  }

  const sinSesion = await pasarLaPuerta(undefined, factura.id);
  comprobar('sin sesion no hay PDF (401)', sinSesion !== null && sinSesion.statusCode === 401);

  console.log(`\nResultado: ${ok} bien, ${mal} mal`);
  process.exit(mal === 0 ? 0 : 1);
})();
