// El mecanico descuenta del almacen los repuestos que gasto en su orden.
//
// Importa: antes el comentario del servicio de diagnostico decia que "el
// descuento real ocurre cuando se registra el movimiento de inventario al
// reparar", pero POST /inventario/movimientos era solo de administrador y
// recepcionista. El mecanico -- el unico que sabe que gasto -- no podia
// registrarlo. Resultado: el stock nunca bajaba solo.
//
// Corre contra la base real y DEJA TODO COMO ESTABA: al final devuelve el
// stock, borra los movimientos que creo y desmarca las lineas.

require('dotenv').config({ quiet: true });
const prisma = require('../../src/config/prismaClient');
const inventarioService = require('../../src/services/inventario.service');

let ok = 0;
let mal = 0;
function comprobar(que, condicion, detalle = '') {
  if (condicion) { ok += 1; console.log(`  OK    ${que}`); }
  else { mal += 1; console.log(`  FALLA ${que}${detalle ? ` -> ${detalle}` : ''}`); }
}

(async () => {
  console.log('=== CONSUMO DE INVENTARIO POR ORDEN ===\n');

  // Una orden ya aprobada, con repuestos del inventario todavia sin descontar.
  const orden = await prisma.ordenTrabajo.findFirst({
    where: {
      estado: { in: ['APROBADA', 'EN_REPARACION', 'LISTA', 'ENTREGADA'] },
      diagnostico: { itemsCotizacion: { some: { repuestoId: { not: null }, descontadoEn: null } } },
    },
    include: { diagnostico: { include: { itemsCotizacion: true } } },
  });

  if (!orden) {
    console.log('  No hay ninguna orden aprobada con repuestos pendientes. Nada que probar.');
    process.exit(0);
  }

  const pendientes = orden.diagnostico.itemsCotizacion.filter(
    (i) => i.repuestoId && !i.descontadoEn
  );
  const repuestoIds = [...new Set(pendientes.map((i) => i.repuestoId))];
  const antes = Object.fromEntries(
    (await prisma.repuesto.findMany({ where: { id: { in: repuestoIds } } })).map((r) => [r.id, r.stock])
  );
  const esperado = { ...antes };
  pendientes.forEach((i) => { esperado[i.repuestoId] -= i.cantidad; });

  console.log(`  Orden de prueba: ${orden.codigo} [${orden.estado}], ${pendientes.length} linea(s)\n`);

  let movimientosCreados = [];
  try {
    // --- 1. el descuento ---
    const resultado = await inventarioService.descontarRepuestosDeOrden(orden.id);
    movimientosCreados = resultado.movimientos;

    comprobar('descuenta una salida por cada linea', resultado.descontados === pendientes.length,
      `descontados=${resultado.descontados}, lineas=${pendientes.length}`);

    const despues = Object.fromEntries(
      (await prisma.repuesto.findMany({ where: { id: { in: repuestoIds } } })).map((r) => [r.id, r.stock])
    );
    const stockCorrecto = repuestoIds.every((id) => despues[id] === esperado[id]);
    comprobar('el stock baja exactamente lo que dice la cotizacion', stockCorrecto,
      JSON.stringify({ antes, esperado, despues }));

    comprobar('cada movimiento queda como SALIDA y ligado a la orden',
      resultado.movimientos.every((m) => m.tipo === 'SALIDA' && m.ordenId === orden.id));

    const items = await prisma.itemCotizacion.findMany({
      where: { id: { in: pendientes.map((i) => i.id) } },
    });
    comprobar('las lineas quedan marcadas con la fecha de salida',
      items.every((i) => i.descontadoEn !== null));

    // --- 2. no se descuenta dos veces ---
    try {
      await inventarioService.descontarRepuestosDeOrden(orden.id);
      comprobar('descontar dos veces NO resta el doble', false, 'la segunda llamada paso');
    } catch (e) {
      comprobar('descontar dos veces NO resta el doble', e.statusCode === 400, e.message);
    }

    const otraVez = Object.fromEntries(
      (await prisma.repuesto.findMany({ where: { id: { in: repuestoIds } } })).map((r) => [r.id, r.stock])
    );
    comprobar('el stock sigue igual tras el segundo intento',
      repuestoIds.every((id) => otraVez[id] === esperado[id]));

    // --- 3. el consumo se puede consultar por orden ---
    const consumo = await inventarioService.listarConsumoDeOrden(orden.id);
    comprobar('el almacen sabe que salio para esta orden', consumo.length === pendientes.length);
  } finally {
    // --- deshacer: la base es compartida, no se deja basura ---
    if (movimientosCreados.length) {
      await prisma.movimientoInventario.deleteMany({
        where: { id: { in: movimientosCreados.map((m) => m.id) } },
      });
    }
    await prisma.itemCotizacion.updateMany({
      where: { id: { in: pendientes.map((i) => i.id) } },
      data: { descontadoEn: null },
    });
    for (const id of repuestoIds) {
      await prisma.repuesto.update({ where: { id }, data: { stock: antes[id] } });
    }
    const restaurado = Object.fromEntries(
      (await prisma.repuesto.findMany({ where: { id: { in: repuestoIds } } })).map((r) => [r.id, r.stock])
    );
    comprobar('la base queda como estaba antes de la prueba',
      repuestoIds.every((id) => restaurado[id] === antes[id]), JSON.stringify({ antes, restaurado }));
  }

  // --- 4. una orden que el cliente no ha aprobado no consume ---
  const sinAprobar = await prisma.ordenTrabajo.findFirst({
    where: { estado: { in: ['RECIBIDA', 'EN_DIAGNOSTICO', 'EN_COTIZACION', 'CANCELADA'] } },
  });
  if (sinAprobar) {
    try {
      await inventarioService.descontarRepuestosDeOrden(sinAprobar.id);
      comprobar('una orden sin aprobar no descuenta stock', false, 'la llamada paso');
    } catch (e) {
      comprobar('una orden sin aprobar no descuenta stock',
        e.statusCode === 400 && /aprobo/.test(e.message), e.message);
    }
  }

  console.log(`\nResultado: ${ok} bien, ${mal} mal`);
  process.exit(mal === 0 ? 0 : 1);
})();
