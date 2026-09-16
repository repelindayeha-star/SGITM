const PDFDocument = require('pdfkit');
const { normalizarEstados } = require('../utils/estadosResumen');

// Los colores del taller, los mismos de la aplicacion. Un documento que sale
// del sistema tiene que parecerse al sistema.
const NEGRO = '#1a1a18';
const GRIS = '#5F5E5A';
const LINEA = '#D3D1C7';
const AMBAR = '#B4740F';

const dinero = (v) =>
  '$ ' + Number(v).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fecha = (d) =>
  new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fechaHora = (d) =>
  new Date(d).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/**
 * Cabecera comun de los documentos que salen del sistema.
 * Devuelve la posicion vertical donde puede empezar el contenido.
 */
function cabecera(doc, titulo, subtitulo) {
  doc.rect(0, 0, doc.page.width, 6).fill(AMBAR);

  doc.fillColor(NEGRO).font('Helvetica-Bold').fontSize(20).text('SIGTM', 50, 42);
  doc.fillColor(GRIS).font('Helvetica').fontSize(8)
    .text('MOTO NEXUS  ·  GESTION DE TALLERES DE MOTOCICLETAS', 50, 66);

  doc.fillColor(NEGRO).font('Helvetica-Bold').fontSize(14)
    .text(titulo, 50, 96);
  if (subtitulo) {
    doc.fillColor(GRIS).font('Helvetica').fontSize(9).text(subtitulo, 50, 114);
  }

  const y = subtitulo ? 134 : 120;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(LINEA).lineWidth(1).stroke();
  return y + 18;
}

function pie(doc, nota) {
  const y = doc.page.height - 58;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(LINEA).lineWidth(1).stroke();
  doc.fillColor(GRIS).font('Helvetica').fontSize(7.5)
    .text(nota, 50, y + 8, { width: doc.page.width - 100 });
  doc.text(`Generado el ${fechaHora(new Date())}`, 50, y + 8,
    { width: doc.page.width - 100, align: 'right' });
}

// Fila de una tabla sencilla. Devuelve la nueva posicion vertical.
function fila(doc, y, columnas, { negrita = false, tam = 9, color = NEGRO } = {}) {
  doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(tam).fillColor(color);
  let alto = 0;
  for (const { texto, x, ancho, alineacion } of columnas) {
    const h = doc.heightOfString(String(texto), { width: ancho });
    doc.text(String(texto), x, y, { width: ancho, align: alineacion || 'left' });
    alto = Math.max(alto, h);
  }
  return y + alto + 6;
}

/**
 * Factura de una orden de trabajo.
 *
 * Se arma con lo que ya esta guardado: el diagnostico, sus items y el total
 * que calculo el servicio. No se recalcula nada aqui: si el PDF sumara por su
 * cuenta y el sistema sumara distinto, la factura impresa y la de pantalla
 * dejarian de coincidir, y la que vale es la de la base.
 */
function facturaPdf(factura) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50, bufferPages: true });
  const orden = factura.orden;
  const cliente = orden?.cliente?.usuario;
  const moto = orden?.motocicleta;
  const diagnostico = orden?.diagnostico;

  let y = cabecera(doc, `Factura ${factura.numero}`, `Orden de trabajo ${orden?.codigo || '—'}`);

  // ── Datos del cliente y de la moto, en dos columnas ────────────
  const col2 = doc.page.width / 2 + 10;
  doc.fillColor(GRIS).font('Helvetica-Bold').fontSize(7.5).text('CLIENTE', 50, y);
  doc.text('MOTOCICLETA', col2, y);
  y += 14;

  doc.fillColor(NEGRO).font('Helvetica').fontSize(9.5);
  doc.text(cliente?.nombre || '—', 50, y, { width: 230 });
  doc.text(`${moto?.marca || ''} ${moto?.modelo || ''}`.trim() || '—', col2, y, { width: 230 });
  y += 14;
  doc.fillColor(GRIS).fontSize(8.5);
  doc.text(cliente?.email || '', 50, y, { width: 230 });
  doc.text(`Placa ${moto?.placa || '—'}${moto?.anio ? '  ·  ' + moto.anio : ''}`, col2, y, { width: 230 });
  y += 13;
  doc.text(`Telefono ${orden?.cliente?.telefono || '—'}`, 50, y, { width: 230 });
  doc.text(`Recibida el ${fecha(orden?.fechaRecibido || factura.createdAt)}`, col2, y, { width: 230 });
  y += 26;

  // ── Problema reportado ─────────────────────────────────────────
  if (orden?.descripcionProblema) {
    doc.fillColor(GRIS).font('Helvetica-Bold').fontSize(7.5).text('MOTIVO DE INGRESO', 50, y);
    y += 12;
    doc.fillColor(NEGRO).font('Helvetica').fontSize(9)
      .text(orden.descripcionProblema, 50, y, { width: doc.page.width - 100 });
    y = doc.y + 16;
  }

  // ── Detalle ────────────────────────────────────────────────────
  const X = { desc: 50, cant: 330, unit: 380, total: 470 };
  const A = { desc: 270, cant: 40, unit: 80, total: 75 };

  doc.rect(50, y - 4, doc.page.width - 100, 20).fill('#F0EDE4');
  fila(doc, y + 1, [
    { texto: 'DESCRIPCION', x: X.desc, ancho: A.desc },
    { texto: 'CANT', x: X.cant, ancho: A.cant, alineacion: 'right' },
    { texto: 'V. UNITARIO', x: X.unit, ancho: A.unit, alineacion: 'right' },
    { texto: 'TOTAL', x: X.total, ancho: A.total, alineacion: 'right' },
  ], { negrita: true, tam: 7.5, color: GRIS });
  y += 22;

  if (diagnostico?.manoObra != null) {
    y = fila(doc, y, [
      { texto: 'Mano de obra', x: X.desc, ancho: A.desc },
      { texto: '1', x: X.cant, ancho: A.cant, alineacion: 'right' },
      { texto: dinero(diagnostico.manoObra), x: X.unit, ancho: A.unit, alineacion: 'right' },
      { texto: dinero(diagnostico.manoObra), x: X.total, ancho: A.total, alineacion: 'right' },
    ]);
  }

  for (const item of diagnostico?.itemsCotizacion || []) {
    const total = Number(item.precioUnitario) * item.cantidad;
    y = fila(doc, y, [
      { texto: item.descripcion, x: X.desc, ancho: A.desc },
      { texto: item.cantidad, x: X.cant, ancho: A.cant, alineacion: 'right' },
      { texto: dinero(item.precioUnitario), x: X.unit, ancho: A.unit, alineacion: 'right' },
      { texto: dinero(total), x: X.total, ancho: A.total, alineacion: 'right' },
    ]);
  }

  y += 6;
  doc.moveTo(330, y).lineTo(doc.page.width - 50, y).strokeColor(LINEA).stroke();
  y += 10;

  y = fila(doc, y, [
    { texto: 'Subtotal', x: X.unit - 80, ancho: 150, alineacion: 'right' },
    { texto: dinero(factura.subtotal), x: X.total, ancho: A.total, alineacion: 'right' },
  ], { tam: 9.5 });

  doc.rect(330, y - 3, doc.page.width - 380, 24).fill('#FBF1DE');
  fila(doc, y + 3, [
    { texto: 'TOTAL', x: X.unit - 80, ancho: 150, alineacion: 'right' },
    { texto: dinero(factura.total), x: X.total, ancho: A.total, alineacion: 'right' },
  ], { negrita: true, tam: 11.5 });
  y += 34;

  doc.fillColor(GRIS).font('Helvetica').fontSize(8.5)
    .text(`Metodo de pago: ${factura.metodoPago}`, 50, y);
  doc.text(`Fecha de emision: ${fecha(factura.createdAt)}`, 50, y, {
    width: doc.page.width - 100, align: 'right',
  });

  pie(doc, `Consulta el estado de tu orden con el codigo ${orden?.codigo || ''}. ` +
           'Documento generado automaticamente por SIGTM.');
  doc.end();
  return doc;
}

/**
 * Informe de operacion del taller: los numeros del panel, pero para imprimir
 * y llevar a una reunion. Incluye el analisis, no solo la cifra suelta.
 */
function informeOperacionPdf({ resumen, ordenes, desde, hasta }) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50, bufferPages: true });
  const periodo = desde || hasta
    ? `Periodo: ${desde ? fecha(desde) : 'inicio'} — ${hasta ? fecha(hasta) : 'hoy'}`
    : 'Todas las ordenes registradas';

  let y = cabecera(doc, 'Informe de operacion del taller', periodo);

  // ── Indicadores ────────────────────────────────────────────────
  const tarjetas = [
    ['Ordenes registradas', String(ordenes.length)],
    ['Clientes', String(resumen.totalClientes)],
    ['Motocicletas', String(resumen.totalMotocicletas)],
    ['Facturado', dinero(resumen.ingresosFacturados)],
  ];
  const ancho = (doc.page.width - 100 - 24) / 4;
  tarjetas.forEach(([etiqueta, valor], i) => {
    const x = 50 + i * (ancho + 8);
    doc.rect(x, y, ancho, 52).fillAndStroke('#FBFAF6', LINEA);
    doc.fillColor(GRIS).font('Helvetica').fontSize(7)
      .text(etiqueta.toUpperCase(), x + 9, y + 9, { width: ancho - 18 });
    doc.fillColor(NEGRO).font('Helvetica-Bold').fontSize(15)
      .text(valor, x + 9, y + 24, { width: ancho - 18 });
  });
  y += 72;

  // ── Analisis: distribucion por etapa ───────────────────────────
  doc.fillColor(NEGRO).font('Helvetica-Bold').fontSize(11)
    .text('En que etapa esta el trabajo', 50, y);
  y += 6;
  doc.fillColor(GRIS).font('Helvetica').fontSize(8.5)
    .text('Cuantas ordenes hay en cada estado y que porcentaje del total representan.',
      50, doc.y + 2, { width: doc.page.width - 100 });
  y = doc.y + 12;

  for (const fila of normalizarEstados(resumen.ordenesPorEstado)) {
    const pct = fila.proporcion * 100;
    doc.fillColor(fila.cantidad ? NEGRO : GRIS).font('Helvetica').fontSize(9)
      .text(fila.etiqueta, 50, y, { width: 130 });
    // Barra proporcional: el ancho ES el dato, no un adorno.
    doc.rect(190, y + 1, 250, 9).fill('#EFEDE5');
    if (pct > 0) doc.rect(190, y + 1, Math.max(2, (250 * pct) / 100), 9).fill(AMBAR);
    doc.fillColor(fila.cantidad ? NEGRO : GRIS).font('Helvetica-Bold').fontSize(9)
      .text(String(fila.cantidad), 450, y, { width: 30, align: 'right' });
    doc.fillColor(GRIS).font('Helvetica').fontSize(8.5)
      .text(pct.toFixed(1) + ' %', 485, y, { width: 60, align: 'right' });
    y += 17;
  }
  y += 10;

  // ── Analisis: repuestos por debajo del minimo ──────────────────
  const bajos = resumen.repuestosStockBajo?.detalle || [];
  doc.fillColor(NEGRO).font('Helvetica-Bold').fontSize(11)
    .text('Repuestos por debajo del minimo', 50, y);
  y = doc.y + 8;

  if (bajos.length === 0) {
    doc.fillColor(GRIS).font('Helvetica').fontSize(9)
      .text('Ninguno. Todas las existencias estan por encima de su minimo.', 50, y);
    y += 20;
  } else {
    doc.rect(50, y - 4, doc.page.width - 100, 18).fill('#F0EDE4');
    fila(doc, y, [
      { texto: 'REPUESTO', x: 55, ancho: 230 },
      { texto: 'CODIGO', x: 290, ancho: 90 },
      { texto: 'EXISTENCIA', x: 385, ancho: 70, alineacion: 'right' },
      { texto: 'MINIMO', x: 460, ancho: 85, alineacion: 'right' },
    ], { negrita: true, tam: 7.5, color: GRIS });
    y += 18;
    for (const r of bajos) {
      y = fila(doc, y, [
        { texto: r.nombre, x: 55, ancho: 230 },
        { texto: r.codigo, x: 290, ancho: 90 },
        { texto: r.stock, x: 385, ancho: 70, alineacion: 'right' },
        { texto: r.stockMinimo, x: 460, ancho: 85, alineacion: 'right' },
      ]);
    }
    y += 8;
    doc.fillColor(GRIS).font('Helvetica-Oblique').fontSize(8.5)
      .text(`${bajos.length} referencia${bajos.length === 1 ? '' : 's'} requiere${bajos.length === 1 ? '' : 'n'} reposicion.`,
        50, y, { width: doc.page.width - 100 });
  }

  pie(doc, 'Informe generado por SIGTM a partir de los datos registrados en el sistema. ' +
           'Las cifras corresponden al momento de la consulta.');
  doc.end();
  return doc;
}

module.exports = { facturaPdf, informeOperacionPdf };
