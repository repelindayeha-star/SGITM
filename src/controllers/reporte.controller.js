const facturaService = require('../services/factura.service');
const ordenRepository = require('../repositories/ordenTrabajo.repository');
const dashboardService = require('../services/dashboard.service');
const { facturaPdf, informeOperacionPdf } = require('../services/reportePdf.service');
const { ordenesExcel } = require('../services/reporteExcel.service');
const AppError = require('../utils/AppError');

// El navegador decide si abre o descarga segun este encabezado. Se usa
// 'inline' para que el PDF se pueda revisar antes de imprimirlo, y
// 'attachment' para el Excel, que no se puede ver dentro del navegador.
function comoPdf(res, nombre) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${nombre}"`);
}

function comoExcel(res, nombre) {
  res.setHeader('Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
}

async function facturaEnPdf(req, res, next) {
  try {
    const factura = await facturaService.obtenerPorId(req.params.id);
    if (!factura) throw new AppError('Factura no encontrada.', 404);

    // La factura del repositorio no trae el diagnostico ni sus items, que es
    // justo el detalle que hay que imprimir. Se pide la orden completa.
    const orden = await ordenRepository.buscarPorId(factura.ordenId);

    comoPdf(res, `factura-${factura.numero}.pdf`);
    facturaPdf({ ...factura, orden }).pipe(res);
  } catch (error) {
    next(error);
  }
}

async function informeOperacion(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const [resumen, todas] = await Promise.all([
      dashboardService.obtenerResumen(),
      ordenRepository.listar(),
    ]);
    const ordenes = filtrarPorFecha(todas, desde, hasta);

    comoPdf(res, `informe-operacion-${hoy()}.pdf`);
    informeOperacionPdf({ resumen, ordenes, desde, hasta }).pipe(res);
  } catch (error) {
    next(error);
  }
}

async function ordenesEnExcel(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const [resumen, todas] = await Promise.all([
      dashboardService.obtenerResumen(),
      ordenRepository.listar(),
    ]);
    const ordenes = filtrarPorFecha(todas, desde, hasta);

    const libro = await ordenesExcel({ ordenes, resumen, desde, hasta });
    comoExcel(res, `ordenes-${hoy()}.xlsx`);
    await libro.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
}

// El filtro va sobre la fecha de recepcion, que es cuando la moto entro al
// taller: es la que tiene sentido para "cuanto trabajo entro este mes".
function filtrarPorFecha(ordenes, desde, hasta) {
  if (!desde && !hasta) return ordenes;
  const inicio = desde ? new Date(desde) : null;
  const fin = hasta ? new Date(`${hasta}T23:59:59`) : null;
  return ordenes.filter((o) => {
    const f = new Date(o.fechaRecibido || o.createdAt);
    if (inicio && f < inicio) return false;
    if (fin && f > fin) return false;
    return true;
  });
}

const hoy = () => new Date().toISOString().slice(0, 10);

module.exports = { facturaEnPdf, informeOperacion, ordenesEnExcel };
