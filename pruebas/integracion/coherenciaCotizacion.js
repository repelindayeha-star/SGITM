// Coherencia de la cotizacion: que no entre a la factura nada que no sea real.
//
// Lo que se comprueba, y por que importa cada cosa:
//
//   1. El precio de un repuesto lo pone el inventario, no la peticion. Antes
//      se guardaba lo que mandara el cliente: una llamada con
//      {"precioUnitario": 2000000} cobraba una bujia como si fuera un motor.
//   2. El nombre de la linea tambien sale del repuesto, para que no diga
//      "aceite" una linea que en realidad descuenta una bateria.
//   3. No se cotiza mas de lo que hay en bodega, contando lo ya cotizado en
//      la misma orden.
//   4. La cotizacion se cierra cuando el cliente aprueba. Antes se le podian
//      agregar lineas con la orden ENTREGADA y facturada -- y como la factura
//      reconstruye su detalle desde la cotizacion, eso cambiaba una factura
//      ya emitida.
//   5. Un repuesto que ya salio del almacen no se borra de la cotizacion: el
//      stock quedaria rebajado sin nada que lo explique.
//
// Monta su propio escenario (orden + diagnostico marcados como PRUEBA) y lo
// borra al final. La base es compartida: no deja rastro.

require('dotenv').config({ quiet: true });
const prisma = require('../../src/config/prismaClient');
const diagnosticoService = require('../../src/services/diagnostico.service');

let ok = 0;
let mal = 0;
function comprobar(que, condicion, detalle = '') {
  if (condicion) { ok += 1; console.log(`  OK    ${que}`); }
  else { mal += 1; console.log(`  FALLA ${que}${detalle ? ` -> ${detalle}` : ''}`); }
}

async function esperarError(que, fn, prueba) {
  try {
    await fn();
    comprobar(que, false, 'la llamada paso sin error');
  } catch (e) {
    comprobar(que, prueba(e), `${e.statusCode}: ${e.message}`);
  }
}

(async () => {
  console.log('=== COHERENCIA DE LA COTIZACION ===\n');

  const cliente = await prisma.cliente.findFirst({ include: { motocicletas: true } });
  const moto = cliente.motocicletas[0];
  const mecanico = await prisma.usuario.findFirst({ where: { rol: 'MECANICO' } });
  const repuesto = await prisma.repuesto.findFirst({ where: { stock: { gt: 2 } } });

  let orden = await prisma.ordenTrabajo.create({
    data: {
      codigo: `OT-PRUEBA-${Date.now().toString(36).toUpperCase()}`,
      clienteId: cliente.id,
      motocicletaId: moto.id,
      mecanicoId: mecanico.id,
      estado: 'EN_DIAGNOSTICO',
      descripcionProblema: 'Escenario de prueba automatica. Se borra al terminar.',
    },
  });
  console.log(`  Escenario: ${orden.codigo}, repuesto "${repuesto.nombre}" stock ${repuesto.stock} a ${repuesto.precio}\n`);

  try {
    const diagnostico = await diagnosticoService.crearDiagnostico({
      ordenId: orden.id,
      descripcion: 'Diagnostico de prueba automatica.',
      observaciones: 'Observacion de prueba.',
      manoObra: 50000,
    });

    comprobar('las observaciones del mecanico si llegan a la base',
      diagnostico.observaciones === 'Observacion de prueba.', String(diagnostico.observaciones));

    // --- 1 y 2: el precio y el nombre los pone el inventario ---
    const linea = await diagnosticoService.agregarItem({
      diagnosticoId: diagnostico.id,
      repuestoId: repuesto.id,
      descripcion: 'Tornillo de nada',
      cantidad: 1,
      precioUnitario: 2000000,
    });

    comprobar('el precio guardado es el del inventario, no el que se mando',
      Number(linea.precioUnitario) === Number(repuesto.precio),
      `guardado ${linea.precioUnitario}, inventario ${repuesto.precio}`);
    comprobar('la descripcion guardada es la del repuesto',
      linea.descripcion === `${repuesto.nombre} (${repuesto.codigo})`, linea.descripcion);

    // --- 3: no se cotiza mas de lo que hay ---
    await esperarError('no deja cotizar mas unidades de las que hay en bodega',
      () => diagnosticoService.agregarItem({
        diagnosticoId: diagnostico.id, repuestoId: repuesto.id, cantidad: repuesto.stock + 5,
      }),
      (e) => e.statusCode === 400 && /stock/i.test(e.message));

    await esperarError('cuenta lo ya cotizado en la misma orden',
      () => diagnosticoService.agregarItem({
        diagnosticoId: diagnostico.id, repuestoId: repuesto.id, cantidad: repuesto.stock,
      }),
      (e) => e.statusCode === 400 && /ya cotizado/i.test(e.message));

    // --- item libre: ahi el precio si es del mecanico ---
    const libre = await diagnosticoService.agregarItem({
      diagnosticoId: diagnostico.id,
      descripcion: 'Soldadura del exosto',
      cantidad: 1,
      precioUnitario: 30000,
    });
    comprobar('el item libre si conserva el precio que puso el mecanico',
      Number(libre.precioUnitario) === 30000 && libre.repuestoId === null);

    await esperarError('un item libre sin precio no entra',
      () => diagnosticoService.agregarItem({
        diagnosticoId: diagnostico.id, descripcion: 'Algo', cantidad: 1,
      }),
      (e) => e.statusCode === 400);

    // --- 4: la cotizacion se cierra al aprobar ---
    await prisma.ordenTrabajo.update({ where: { id: orden.id }, data: { estado: 'APROBADA' } });

    await esperarError('con la orden aprobada no se agregan mas items',
      () => diagnosticoService.agregarItem({
        diagnosticoId: diagnostico.id, repuestoId: repuesto.id, cantidad: 1,
      }),
      (e) => e.statusCode === 400 && /cerrada/i.test(e.message));

    await esperarError('con la orden aprobada no se cambia la mano de obra',
      () => diagnosticoService.actualizarDiagnostico(diagnostico.id, { manoObra: 999999 }),
      (e) => e.statusCode === 400 && /cerrada/i.test(e.message));

    await esperarError('con la orden aprobada no se quitan items',
      () => diagnosticoService.eliminarItem(libre.id),
      (e) => e.statusCode === 400 && /cerrada/i.test(e.message));

    // --- 5: lo que ya salio del almacen no se borra de la cotizacion ---
    await prisma.itemCotizacion.update({
      where: { id: linea.id }, data: { descontadoEn: new Date() },
    });
    await prisma.ordenTrabajo.update({ where: { id: orden.id }, data: { estado: 'EN_DIAGNOSTICO' } });

    await esperarError('un repuesto ya descontado no se borra de la cotizacion',
      () => diagnosticoService.eliminarItem(linea.id),
      (e) => e.statusCode === 400 && /almacen/i.test(e.message));

    // y una linea que no ha salido si se puede quitar
    await diagnosticoService.eliminarItem(libre.id);
    const quedan = await prisma.itemCotizacion.findMany({ where: { diagnosticoId: diagnostico.id } });
    comprobar('una linea que no ha salido si se puede quitar', quedan.length === 1);
  } finally {
    // --- limpiar el escenario ---
    const diag = await prisma.diagnostico.findUnique({ where: { ordenId: orden.id } });
    if (diag) {
      await prisma.itemCotizacion.deleteMany({ where: { diagnosticoId: diag.id } });
      await prisma.diagnostico.delete({ where: { id: diag.id } });
    }
    await prisma.movimientoInventario.deleteMany({ where: { ordenId: orden.id } });
    await prisma.historialEstadoOrden.deleteMany({ where: { ordenId: orden.id } });
    await prisma.ordenTrabajo.delete({ where: { id: orden.id } });
    const sobra = await prisma.ordenTrabajo.findUnique({ where: { id: orden.id } });
    comprobar('el escenario de prueba queda borrado de la base', sobra === null);
  }

  console.log(`\nResultado: ${ok} bien, ${mal} mal`);
  process.exit(mal === 0 ? 0 : 1);
})();
