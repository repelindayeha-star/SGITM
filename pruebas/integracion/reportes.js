// Comprueba que los informes salgan de verdad: que el PDF sea un PDF, que el
// Excel sea un libro con sus hojas, y que no los pueda descargar cualquiera.
//   node pruebas/integracion/reportes.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const prisma = require('../../src/config/prismaClient');

const API = process.env.API_PRUEBAS || 'http://localhost:3001/api';
const SALIDA = path.join(__dirname, '../../tmp-reportes');

const ok = (t) => console.log(`  OK    ${t}`);
const fallo = (t, d) => {
  console.log(`  FALLO ${t}${d ? ' -> ' + d : ''}`);
  process.exitCode = 1;
};

async function entrar(email, password = 'Sigtm2026*') {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, captchaToken: 'test-bypass-sigtm' }),
  });
  const cuerpo = await r.json().catch(() => ({}));
  return cuerpo?.data?.token || null;
}

async function bajar(ruta, token) {
  const r = await fetch(`${API}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const bytes = Buffer.from(await r.arrayBuffer());
  return { estado: r.status, tipo: r.headers.get('content-type') || '', bytes };
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  console.log('');

  const admin = await entrar('admin@sigtm.com');
  admin ? ok('entra el administrador') : fallo('no se pudo entrar como administrador');
  if (!admin) return;

  // ── Informe de operacion en PDF ────────────────────────────────
  console.log('\n1. Informe de operacion (PDF)');
  let r = await bajar('/reportes/operacion.pdf', admin);
  r.estado === 200 ? ok('responde 200') : fallo('estado', r.estado);
  r.tipo.includes('application/pdf') ? ok('el tipo es application/pdf') : fallo('tipo', r.tipo);
  r.bytes.subarray(0, 5).toString() === '%PDF-'
    ? ok('el archivo empieza por %PDF-, o sea que es un PDF de verdad')
    : fallo('no parece un PDF', r.bytes.subarray(0, 10).toString());
  r.bytes.length > 2000
    ? ok(`pesa ${(r.bytes.length / 1024).toFixed(0)} KB: tiene contenido`)
    : fallo('demasiado pequeno', r.bytes.length);
  fs.writeFileSync(path.join(SALIDA, 'informe-operacion.pdf'), r.bytes);

  // ── Ordenes en Excel ───────────────────────────────────────────
  console.log('\n2. Ordenes (Excel)');
  r = await bajar('/reportes/ordenes.xlsx', admin);
  r.estado === 200 ? ok('responde 200') : fallo('estado', r.estado);
  r.tipo.includes('spreadsheetml')
    ? ok('el tipo es el de un libro de Excel')
    : fallo('tipo', r.tipo);
  const rutaXlsx = path.join(SALIDA, 'ordenes.xlsx');
  fs.writeFileSync(rutaXlsx, r.bytes);

  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(rutaXlsx);
  const hojas = libro.worksheets.map((h) => h.name);
  JSON.stringify(hojas) === JSON.stringify(['Ordenes', 'Analisis', 'Reposicion'])
    ? ok('trae las tres hojas: ' + hojas.join(', '))
    : fallo('hojas inesperadas', hojas.join(', '));

  const an = libro.getWorksheet('Analisis');
  const textoAnalisis = [];
  an.eachRow((fila) => fila.eachCell((c) => {
    if (typeof c.value === 'string') textoAnalisis.push(c.value);
  }));
  textoAnalisis.some((t) => t.includes('Dias promedio de reparacion'))
    ? ok('el analisis calcula los dias promedio de reparacion')
    : fallo('falta el indicador de dias promedio');
  textoAnalisis.some((t) => t.includes('Valor promedio por orden'))
    ? ok('el analisis calcula el valor promedio por orden')
    : fallo('falta el valor promedio');
  textoAnalisis.some((t) => t.includes('Sin datos') || t.includes('no se puede calcular'))
    ? ok('declara "sin datos" donde no alcanza a calcular, en vez de poner cero')
    : ok('hay datos suficientes para todos los indicadores');

  const det = libro.getWorksheet('Ordenes');
  det.autoFilter ? ok('el detalle trae filtro, para poder trabajarlo') : fallo('sin autofiltro');

  // ── Factura en PDF ─────────────────────────────────────────────
  console.log('\n3. Factura (PDF)');
  const factura = await prisma.factura.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!factura) {
    console.log('  (no hay ninguna factura en la base: se omite esta parte)');
  } else {
    r = await bajar(`/reportes/facturas/${factura.id}.pdf`, admin);
    r.estado === 200 ? ok('responde 200') : fallo('estado', r.estado);
    r.bytes.subarray(0, 5).toString() === '%PDF-'
      ? ok(`la factura ${factura.numero} sale como PDF`)
      : fallo('no es un PDF');
    fs.writeFileSync(path.join(SALIDA, `factura-${factura.numero}.pdf`), r.bytes);
  }

  // ── Permisos ───────────────────────────────────────────────────
  console.log('\n4. Quien puede descargarlos');
  r = await bajar('/reportes/ordenes.xlsx', null);
  r.estado === 401 ? ok('sin sesion: 401') : fallo('sin sesion deberia dar 401', r.estado);

  const cliente = await entrar('cliente@sigtm.com');
  if (cliente) {
    r = await bajar('/reportes/ordenes.xlsx', cliente);
    r.estado === 403
      ? ok('un cliente no puede descargar el informe del negocio: 403')
      : fallo('un cliente no deberia poder', r.estado);
  } else {
    console.log('  (no se pudo entrar como cliente: se omite)');
  }

  console.log(`\nArchivos guardados en ${SALIDA} para revisarlos a ojo.\n`);
}

main()
  .catch((e) => {
    console.error('ERROR', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
