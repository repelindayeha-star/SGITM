const diagnosticoRepository = require('../repositories/diagnostico.repository');
const itemRepository = require('../repositories/itemCotizacion.repository');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const repuestoRepository = require('../repositories/repuesto.repository');
const AppError = require('../utils/AppError');

// La cotizacion se arma mientras la orden esta en diagnostico o en
// cotizacion. En cuanto el cliente aprueba, queda cerrada: el numero que
// aprobo es el que se le cobra.
//
// Sin este cierre la cotizacion se podia seguir tocando con la orden
// ENTREGADA y ya facturada. Y como la factura no congela sus lineas y las
// reconstruye desde la cotizacion, agregar un item despues cambiaba una
// factura ya emitida. Eso no es un descuido de interfaz: es el camino corto
// para cobrar algo que el cliente nunca aprobo.
const ESTADOS_COTIZABLES = ['EN_DIAGNOSTICO', 'EN_COTIZACION'];

function exigirCotizacionAbierta(orden, accion) {
  if (!ESTADOS_COTIZABLES.includes(orden.estado)) {
    throw new AppError(
      `La cotizacion de esta orden ya esta cerrada (estado ${orden.estado}) y no se puede ${accion}. ` +
        'Una vez el cliente aprueba, el trabajo y el precio son los que aprobo.',
      400
    );
  }
}

async function crearDiagnostico({ ordenId, descripcion, observaciones, manoObra }) {
  const orden = await ordenRepository.buscarPorId(ordenId);
  if (!orden) {
    throw new AppError('La orden de trabajo no existe.', 404);
  }

  const existente = await diagnosticoRepository.buscarPorOrdenId(ordenId);
  if (existente) {
    throw new AppError('Esta orden ya tiene un diagnóstico registrado.', 409);
  }

  if (orden.estado !== 'EN_DIAGNOSTICO') {
    throw new AppError(
      `Solo se puede crear un diagnóstico cuando la orden está en estado EN_DIAGNOSTICO (actual: ${orden.estado}).`,
      400
    );
  }

  return diagnosticoRepository.crear({ ordenId, descripcion, observaciones, manoObra });
}

async function obtenerPorOrdenId(ordenId) {
  const diagnostico = await diagnosticoRepository.buscarPorOrdenId(ordenId);
  if (!diagnostico) {
    throw new AppError('Esta orden no tiene un diagnóstico registrado.', 404);
  }
  return diagnostico;
}

async function actualizarDiagnostico(id, datos) {
  const diagnostico = await diagnosticoRepository.buscarPorId(id);
  if (!diagnostico) {
    throw new AppError('Diagnóstico no encontrado.', 404);
  }

  const orden = await ordenRepository.buscarPorId(diagnostico.ordenId);
  exigirCotizacionAbierta(orden, 'cambiar el diagnostico ni la mano de obra');

  return diagnosticoRepository.actualizar(id, datos);
}

/**
 * Agrega una linea a la cotizacion.
 *
 * Dos clases de linea, con reglas distintas:
 *
 *  - Repuesto del inventario: el precio y el nombre los pone el servidor a
 *    partir del repuesto. Lo que venga en la peticion se ignora. Antes se
 *    guardaba el precio que mandara el cliente, asi que bastaba una llamada
 *    con {"precioUnitario": 2000000} para cobrar una bujia como si fuera un
 *    motor. La interfaz rellenaba el precio correcto, pero la interfaz no es
 *    el control: cualquiera puede llamar la API por fuera.
 *
 *  - Item libre (soldadura, un trabajo a terceros): ahi el mecanico si pone
 *    el precio, porque no hay ninguna tarifa guardada de donde sacarlo. El
 *    control no es el campo, es la aprobacion: esa linea le aparece al
 *    cliente en la cotizacion y sin su aprobacion la orden no avanza.
 *
 * No descuenta stock: eso pasa cuando el trabajo esta aprobado, con
 * POST /inventario/ordenes/:ordenId/consumo.
 */
async function agregarItem({ diagnosticoId, repuestoId, descripcion, cantidad, precioUnitario }) {
  const diagnostico = await diagnosticoRepository.buscarPorId(diagnosticoId);
  if (!diagnostico) {
    throw new AppError('Diagnóstico no encontrado.', 404);
  }

  const orden = await ordenRepository.buscarPorId(diagnostico.ordenId);
  exigirCotizacionAbierta(orden, 'agregar items');

  if (!repuestoId) {
    if (!descripcion || !String(descripcion).trim()) {
      throw new AppError('La descripcion del item es obligatoria.', 400);
    }
    if (precioUnitario === undefined || precioUnitario === null || Number(precioUnitario) < 0) {
      throw new AppError('El precio unitario del item libre es obligatorio.', 400);
    }
    return itemRepository.crear({
      diagnosticoId,
      repuestoId: null,
      descripcion: String(descripcion).trim(),
      cantidad,
      precioUnitario,
    });
  }

  const repuesto = await repuestoRepository.buscarPorId(repuestoId);
  if (!repuesto) {
    throw new AppError('El repuesto indicado no existe.', 404);
  }

  // No se cotiza lo que no hay. Se cuenta tambien lo que ya se cotizo de ese
  // mismo repuesto en esta orden: si no, tres lineas de 2 pasarian el control
  // una por una teniendo 4 en bodega, y el descuento fallaria al final --
  // cuando la moto ya esta desarmada.
  const yaCotizado = diagnostico.itemsCotizacion
    .filter((item) => item.repuestoId === repuestoId && !item.descontadoEn)
    .reduce((suma, item) => suma + item.cantidad, 0);

  if (yaCotizado + cantidad > repuesto.stock) {
    throw new AppError(
      `No hay stock suficiente de ${repuesto.nombre}. ` +
        `Disponible: ${repuesto.stock}` +
        (yaCotizado ? `, ya cotizado en esta orden: ${yaCotizado}` : '') +
        `, se piden ${cantidad}.`,
      400
    );
  }

  return itemRepository.crear({
    diagnosticoId,
    repuestoId,
    // El nombre y el precio salen del inventario, no de la peticion.
    descripcion: `${repuesto.nombre} (${repuesto.codigo})`,
    cantidad,
    precioUnitario: repuesto.precio,
  });
}

async function eliminarItem(id) {
  const item = await itemRepository.buscarPorId(id);
  if (!item) {
    throw new AppError('Ítem de cotización no encontrado.', 404);
  }

  // Si el repuesto ya salio del almacen, borrar la linea dejaria el stock
  // rebajado sin nada que lo explique y un movimiento de salida apuntando a
  // una linea que ya no existe. Para devolverlo hay que registrar una
  // ENTRADA en inventario, que es lo que de verdad paso.
  if (item.descontadoEn) {
    throw new AppError(
      'Este repuesto ya salio del almacen para esta orden. Para devolverlo, ' +
        'registra una entrada en inventario en vez de borrar la linea.',
      400
    );
  }

  const orden = await ordenRepository.buscarPorId(item.diagnostico.ordenId);
  exigirCotizacionAbierta(orden, 'quitar items');

  return itemRepository.eliminar(id);
}

/**
 * Calcula el total de la cotización: mano de obra + suma de (cantidad * precio) de cada ítem.
 */
async function calcularTotalCotizacion(diagnosticoId) {
  const diagnostico = await diagnosticoRepository.buscarPorId(diagnosticoId);
  if (!diagnostico) {
    throw new AppError('Diagnóstico no encontrado.', 404);
  }

  const totalItems = diagnostico.itemsCotizacion.reduce((acumulado, item) => {
    return acumulado + Number(item.cantidad) * Number(item.precioUnitario);
  }, 0);

  const manoObra = Number(diagnostico.manoObra);

  return {
    diagnosticoId,
    manoObra,
    totalItems,
    total: manoObra + totalItems,
    items: diagnostico.itemsCotizacion,
  };
}

module.exports = {
  ESTADOS_COTIZABLES,
  crearDiagnostico,
  obtenerPorOrdenId,
  actualizarDiagnostico,
  agregarItem,
  eliminarItem,
  calcularTotalCotizacion,
};