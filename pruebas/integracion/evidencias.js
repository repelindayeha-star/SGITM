// Recorre las fotografias de evidencia de punta a punta: subir, ver, quien
// puede y quien no, y borrar. Usa una imagen generada al vuelo, asi que no
// depende de ningun archivo en el disco.
//   node pruebas/integracion/evidencias.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const prisma = require('../../src/config/prismaClient');

const API = process.env.API_PRUEBAS || 'http://localhost:3001/api';

const ok = (t) => console.log(`  OK    ${t}`);
const fallo = (t, d) => {
  console.log(`  FALLO ${t}${d ? ' -> ' + d : ''}`);
  process.exitCode = 1;
};

// PNG de 1x1 valido, en bytes. Suficiente para que el servidor lo acepte
// como imagen sin tener que cargar un archivo de verdad.
const PNG_MINIMO = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function entrar(email, password = 'Sigtm2026*') {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, captchaToken: 'test-bypass-sigtm' }),
  });
  return (await r.json().catch(() => ({})))?.data?.token || null;
}

function formularioConImagen({ bytes, nombre, tipo, momento, descripcion }) {
  const fd = new FormData();
  fd.append('imagen', new Blob([bytes], { type: tipo }), nombre);
  if (momento) fd.append('momento', momento);
  if (descripcion) fd.append('descripcion', descripcion);
  return fd;
}

async function subir(ordenId, token, opciones) {
  const r = await fetch(`${API}/ordenes/${ordenId}/evidencias`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formularioConImagen(opciones),
  });
  return { estado: r.status, cuerpo: await r.json().catch(() => ({})) };
}

async function main() {
  console.log('');
  const recepcion = await entrar('recepcion@sigtm.com');
  recepcion ? ok('entra la recepcionista') : fallo('no se pudo entrar');
  if (!recepcion) return;

  // Una orden abierta de la semilla de demostracion.
  const orden = await prisma.ordenTrabajo.findFirst({
    where: { codigo: { startsWith: 'OT-2026-DEMO' }, estado: { notIn: ['ENTREGADA', 'CANCELADA'] } },
  });
  if (!orden) return fallo('no hay ninguna orden abierta de demostracion');
  console.log(`Orden de prueba: ${orden.codigo} (${orden.estado})\n`);

  const creadas = [];

  console.log('1. Subir');
  let r = await subir(orden.id, recepcion, {
    bytes: PNG_MINIMO, nombre: 'antes.png', tipo: 'image/png',
    momento: 'ANTES', descripcion: 'Pastillas desgastadas',
  });
  r.estado === 201 ? ok('sube una imagen valida') : fallo('subida', JSON.stringify(r.cuerpo));
  if (r.cuerpo?.data) creadas.push(r.cuerpo.data);

  const ev = r.cuerpo?.data;
  ev?.url ? ok('devuelve la direccion de la imagen') : fallo('sin url');
  ev?.momento === 'ANTES' ? ok('guarda el momento indicado') : fallo('momento', ev?.momento);
  ev?.descripcion === 'Pastillas desgastadas' ? ok('guarda la descripcion') : fallo('descripcion');
  ev?.usuario?.nombre ? ok(`registra quien la subio: ${ev.usuario.nombre}`) : fallo('sin autor');

  console.log('\n2. Lo que NO se acepta');
  r = await subir(orden.id, recepcion, {
    bytes: Buffer.from('esto no es una imagen'), nombre: 'malo.txt', tipo: 'text/plain',
  });
  r.estado === 400 ? ok('rechaza un archivo que no es imagen') : fallo('tipo invalido', r.estado);

  r = await subir(orden.id, recepcion, {
    bytes: Buffer.alloc(6 * 1024 * 1024, 1), nombre: 'gorda.png', tipo: 'image/png',
  });
  r.estado === 400 ? ok('rechaza una imagen de mas de 5 MB') : fallo('tamano', r.estado);

  r = await subir(orden.id, recepcion, {
    bytes: PNG_MINIMO, nombre: 'x.png', tipo: 'image/png', momento: 'CUALQUIERA',
  });
  r.estado === 400 ? ok('rechaza un momento que no existe') : fallo('momento invalido', r.estado);

  console.log('\n3. Quien puede');
  const cliente = await entrar('cliente@sigtm.com');
  if (cliente) {
    r = await subir(orden.id, cliente, { bytes: PNG_MINIMO, nombre: 'x.png', tipo: 'image/png' });
    r.estado === 403 ? ok('un cliente no puede subir evidencias') : fallo('cliente subiendo', r.estado);
  }

  const sinSesion = await fetch(`${API}/ordenes/${orden.id}/evidencias`);
  sinSesion.status === 401 ? ok('sin sesion no se listan: 401') : fallo('sin sesion', sinSesion.status);

  console.log('\n4. El cliente SI las ve por el seguimiento publico');
  const publico = await fetch(`${API}/ordenes/seguimiento/${orden.codigo}`);
  const cuerpoPublico = await publico.json();
  const evidenciasPublicas = cuerpoPublico?.data?.evidencias || [];
  evidenciasPublicas.length > 0
    ? ok('las fotos salen en el seguimiento publico, sin necesidad de cuenta')
    : fallo('el seguimiento publico no trae las fotos');
  const texto = JSON.stringify(cuerpoPublico);
  !texto.includes('usuario') && !texto.includes('@')
    ? ok('y sin filtrar quien las tomo ni ningun correo')
    : fallo('el seguimiento publico esta filtrando datos del personal');

  console.log('\n5. Borrar');
  for (const c of creadas) {
    const d = await fetch(`${API}/ordenes/${orden.id}/evidencias/${c.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recepcion}` },
    });
    d.status === 200 ? ok('borra la evidencia') : fallo('borrado', d.status);
  }
  const quedan = await prisma.evidenciaOrden.count({ where: { ordenId: orden.id } });
  quedan === 0 ? ok('no queda ninguna en la base') : fallo('quedaron evidencias', quedan);

  console.log('');
}

main()
  .catch((e) => {
    console.error('ERROR', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
