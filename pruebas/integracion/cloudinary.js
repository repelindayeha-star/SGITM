// Comprueba que las fotos de las reparaciones llegan de verdad a la nube.
//
// Importa: sin Cloudinary configurado el servicio guarda las fotos en el disco
// del servidor, y en un alojamiento en la nube ese disco se borra en cada
// reinicio. Es decir, las fotos de las reparaciones desapareceriajn solas. Esta
// prueba sube una imagen de verdad, comprueba que la direccion devuelta es de
// Cloudinary y despues la borra para no dejar basura en la cuenta.

require('dotenv').config();
const env = require('../../src/config/env');
const almacenamiento = require('../../src/services/almacenamiento.service');

// Un PNG minimo valido, 1x1 pixel. Se escribe aqui en vez de leer un archivo
// para que la prueba no dependa de que exista ninguna imagen en el disco.
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

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

(async () => {
  console.log('=== FOTOS DE LAS REPARACIONES ===\n');

  console.log(`  configurado : ${env.cloudinary.configurado ? 'SI' : 'NO'}`);
  console.log(`  nube        : ${env.cloudinary.nombreNube || '(vacio)'}`);
  console.log(`  api key     : ${env.cloudinary.apiKey ? 'definida' : 'VACIA'}`);
  console.log(`  api secret  : ${env.cloudinary.apiSecret ? 'definida' : 'VACIA'}`);
  console.log('');

  if (!env.cloudinary.configurado) {
    console.log('  Sin configurar: las fotos irian al disco del servidor y se');
    console.log('  perderian en cada reinicio. Completa CLOUDINARY_* en .env.');
    process.exit(1);
  }

  const archivo = {
    buffer: PNG_1x1,
    mimetype: 'image/png',
    originalname: 'prueba-sigtm.png',
    size: PNG_1x1.length,
  };

  console.log('-- Subiendo --');
  let subida;
  try {
    subida = await almacenamiento.subirImagen(archivo, { carpeta: 'sigtm/pruebas' });
    comprobar('la imagen sube sin error', true);
  } catch (e) {
    comprobar('la imagen sube sin error', false, e.message);
    process.exit(1);
  }

  console.log(`\n  url: ${subida.url}`);
  comprobar('devuelve una direccion', !!subida.url);
  comprobar(
    'la direccion es de Cloudinary, no del disco del servidor',
    /res\.cloudinary\.com/.test(subida.url || ''),
    subida.url
  );
  comprobar('lleva el nombre de la nube correcta', (subida.url || '').includes(env.cloudinary.nombreNube));
  comprobar('devuelve un identificador para poder borrarla', !!subida.identificadorPublico);
  if (subida.urlMiniatura) {
    comprobar('genera tambien una miniatura', /res\.cloudinary\.com/.test(subida.urlMiniatura));
  }

  console.log('\n-- Comprobando que la imagen existe de verdad en la nube --');
  try {
    const r = await fetch(subida.url, { method: 'GET' });
    comprobar('la imagen se puede descargar', r.ok, `estado ${r.status}`);
    comprobar('llega como imagen', (r.headers.get('content-type') || '').startsWith('image/'));
  } catch (e) {
    comprobar('la imagen se puede descargar', false, e.message);
  }

  console.log('\n-- Limpieza --');
  try {
    await almacenamiento.borrarImagen({
      identificadorPublico: subida.identificadorPublico,
      url: subida.url,
    });
    console.log('  borrada de la cuenta');
  } catch (e) {
    console.log(`  no se pudo borrar: ${e.message}`);
  }

  console.log(`\n=== ${ok} en verde, ${mal} en rojo ===`);
  process.exit(mal === 0 ? 0 : 1);
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
