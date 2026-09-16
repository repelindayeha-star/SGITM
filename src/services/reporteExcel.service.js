const ExcelJS = require('exceljs');
const { normalizarEstados, ETIQUETA_ESTADO, ABIERTOS } = require('../utils/estadosResumen');

const NEGRO = 'FF1A1A18';
const CREMA = 'FFF0EDE4';
const AMBAR = 'FFB4740F';
const GRIS = 'FF5F5E5A';

function titulo(hoja, texto, subtitulo, columnas) {
  hoja.mergeCells(1, 1, 1, columnas);
  const t = hoja.getCell(1, 1);
  t.value = texto;
  t.font = { name: 'Calibri', size: 15, bold: true, color: { argb: NEGRO } };
  t.alignment = { vertical: 'middle' };
  hoja.getRow(1).height = 26;

  hoja.mergeCells(2, 1, 2, columnas);
  const s = hoja.getCell(2, 1);
  s.value = subtitulo;
  s.font = { name: 'Calibri', size: 9, color: { argb: GRIS } };
  hoja.getRow(2).height = 16;
}

function encabezado(hoja, fila, valores) {
  const f = hoja.getRow(fila);
  f.values = valores;
  f.eachCell((c) => {
    c.font = { name: 'Calibri', size: 9, bold: true, color: { argb: GRIS } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREMA } };
    c.alignment = { vertical: 'middle' };
    c.border = { bottom: { style: 'thin', color: { argb: 'FFD3D1C7' } } };
  });
  f.height = 20;
  return fila + 1;
}

/**
 * Libro de trabajo con el detalle de las ordenes y su analisis.
 *
 * Tres hojas a proposito: el detalle para trabajar con el, el analisis ya
 * calculado para leerlo de una, y los repuestos bajo minimo, que es lo unico
 * que exige una accion inmediata.
 */
async function ordenesExcel({ ordenes, resumen, desde, hasta }) {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'SIGTM — Moto Nexus';
  libro.created = new Date();

  const periodo = desde || hasta
    ? `Periodo: ${desde || 'inicio'} a ${hasta || 'hoy'}`
    : 'Todas las ordenes registradas';
  const generado = `Generado el ${new Date().toLocaleString('es-CO')}`;

  // ── Hoja 1: detalle ────────────────────────────────────────────
  const det = libro.addWorksheet('Ordenes', { views: [{ state: 'frozen', ySplit: 4 }] });
  det.columns = [
    { width: 18 }, { width: 26 }, { width: 22 }, { width: 12 },
    { width: 18 }, { width: 20 }, { width: 14 }, { width: 14 }, { width: 16 },
  ];
  titulo(det, 'Ordenes de trabajo', `${periodo}  ·  ${generado}`, 9);

  let f = encabezado(det, 4, [
    'Codigo', 'Cliente', 'Motocicleta', 'Placa',
    'Estado', 'Mecanico', 'Recibida', 'Entregada', 'Facturado',
  ]);

  for (const o of ordenes) {
    const fila = det.getRow(f);
    fila.values = [
      o.codigo,
      o.cliente?.usuario?.nombre || '—',
      `${o.motocicleta?.marca || ''} ${o.motocicleta?.modelo || ''}`.trim() || '—',
      o.motocicleta?.placa || '—',
      ETIQUETA_ESTADO[o.estado] || o.estado,
      o.mecanico?.nombre || 'Sin asignar',
      o.fechaRecibido ? new Date(o.fechaRecibido) : null,
      o.fechaEntrega ? new Date(o.fechaEntrega) : null,
      o.factura ? Number(o.factura.total) : null,
    ];
    fila.getCell(1).font = { name: 'Consolas', size: 10 };
    fila.getCell(7).numFmt = 'dd/mm/yyyy';
    fila.getCell(8).numFmt = 'dd/mm/yyyy';
    fila.getCell(9).numFmt = '"$" #,##0';
    fila.height = 17;
    f += 1;
  }

  // Filtro para que quien reciba el archivo pueda trabajarlo, no solo mirarlo.
  if (ordenes.length > 0) {
    det.autoFilter = { from: { row: 4, column: 1 }, to: { row: f - 1, column: 9 } };
  }

  // ── Hoja 2: analisis ───────────────────────────────────────────
  const an = libro.addWorksheet('Analisis');
  an.columns = [{ width: 26 }, { width: 14 }, { width: 14 }, { width: 46 }];
  titulo(an, 'Analisis de la operacion', `${periodo}  ·  ${generado}`, 4);

  let a = 4;
  an.getCell(a, 1).value = 'Distribucion por etapa';
  an.getCell(a, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: NEGRO } };
  a += 1;
  a = encabezado(an, a, ['Estado', 'Ordenes', 'Porcentaje', 'Lectura']);

  const abiertas = ABIERTOS;

  for (const e of normalizarEstados(resumen.ordenesPorEstado)) {
    const fila = an.getRow(a);
    let lectura = '';
    if (e.cantidad === 0) {
      lectura = 'Ninguna orden en esta etapa.';
    } else if (e.estado === 'LISTA') {
      lectura = 'Motos terminadas que el cliente aun no ha recogido.';
    } else if (e.estado === 'EN_COTIZACION') {
      lectura = 'Esperando que el cliente apruebe. El taller no puede avanzar solo.';
    } else if (e.estado === 'CANCELADA') {
      lectura = 'Ordenes que no llegaron a terminarse.';
    } else if (e.abierto) {
      lectura = 'Trabajo en curso.';
    } else if (e.estado === 'ENTREGADA') {
      lectura = 'Ciclo completo.';
    }
    fila.values = [e.etiqueta, e.cantidad, e.proporcion, lectura];
    fila.getCell(3).numFmt = '0.0%';
    fila.getCell(4).font = { name: 'Calibri', size: 9, color: { argb: GRIS } };
    a += 1;
  }

  a += 2;
  an.getCell(a, 1).value = 'Indicadores';
  an.getCell(a, 1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: NEGRO } };
  a += 1;
  a = encabezado(an, a, ['Indicador', 'Valor', '', 'Como se calcula']);

  const entregadas = ordenes.filter((o) => o.estado === 'ENTREGADA');
  // Dias que tarda una moto desde que entra hasta que se entrega. Es el
  // numero que un duenno de taller pide primero.
  const dias = entregadas
    .filter((o) => o.fechaRecibido && o.fechaEntrega)
    .map((o) => (new Date(o.fechaEntrega) - new Date(o.fechaRecibido)) / 86400000);
  const promedioDias = dias.length ? dias.reduce((s, d) => s + d, 0) / dias.length : null;

  const facturadas = ordenes.filter((o) => o.factura);
  const ticket = facturadas.length
    ? facturadas.reduce((s, o) => s + Number(o.factura.total), 0) / facturadas.length
    : null;
  const enCurso = ordenes.filter((o) => abiertas.includes(o.estado)).length;

  const indicadores = [
    ['Ordenes registradas', ordenes.length, null,
      'Total de ordenes en el periodo.'],
    ['Ordenes en curso', enCurso, null,
      'Las que no estan entregadas ni canceladas.'],
    ['Ordenes entregadas', entregadas.length, null,
      'Ciclo completo.'],
    ['Dias promedio de reparacion', promedioDias, '0.0',
      dias.length ? `Desde que entra hasta que se entrega. Sobre ${dias.length} ordenes entregadas.`
                  : 'Sin ordenes entregadas con las dos fechas: no se puede calcular.'],
    ['Total facturado', Number(resumen.ingresosFacturados) || 0, '"$" #,##0',
      'Suma de las facturas emitidas.'],
    ['Valor promedio por orden', ticket, '"$" #,##0',
      facturadas.length ? `Sobre ${facturadas.length} ordenes facturadas.`
                        : 'Sin facturas: no se puede calcular.'],
    ['Clientes registrados', resumen.totalClientes, null, 'Cuentas de cliente en el sistema.'],
    ['Motocicletas registradas', resumen.totalMotocicletas, null, 'Motos asociadas a algun cliente.'],
  ];

  for (const [nombre, valor, formato, comoSeCalcula] of indicadores) {
    const fila = an.getRow(a);
    fila.values = [nombre, valor == null ? 'Sin datos' : valor, '', comoSeCalcula];
    if (formato && valor != null) fila.getCell(2).numFmt = formato;
    fila.getCell(2).font = { name: 'Calibri', size: 10, bold: true };
    fila.getCell(4).font = { name: 'Calibri', size: 9, color: { argb: GRIS } };
    a += 1;
  }

  // ── Hoja 3: reposicion ─────────────────────────────────────────
  const inv = libro.addWorksheet('Reposicion');
  inv.columns = [{ width: 34 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 }];
  titulo(inv, 'Repuestos por debajo del minimo',
    'Lo unico de este informe que exige una accion inmediata.  ' + generado, 5);

  let i = encabezado(inv, 4, ['Repuesto', 'Codigo', 'Existencia', 'Minimo', 'Faltante']);
  const bajos = resumen.repuestosStockBajo?.detalle || [];
  for (const r of bajos) {
    const fila = inv.getRow(i);
    fila.values = [r.nombre, r.codigo, r.stock, r.stockMinimo, Math.max(0, r.stockMinimo - r.stock)];
    fila.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: AMBAR } };
    i += 1;
  }
  if (bajos.length === 0) {
    inv.getCell(4, 1).value = 'Ninguna referencia esta por debajo de su minimo.';
    inv.getCell(4, 1).font = { name: 'Calibri', size: 10, color: { argb: GRIS } };
  }

  return libro;
}

module.exports = { ordenesExcel };
