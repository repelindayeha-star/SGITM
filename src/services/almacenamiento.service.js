const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const env = require('../config/env');

const CARPETA_LOCAL = path.join(__dirname, '../../uploads');

if (env.cloudinary.configurado) {
  cloudinary.config({
    cloud_name: env.cloudinary.nombreNube,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
} else {
  console.warn(
    '\n[imagenes] Cloudinary no esta configurado: las fotos se guardan en el\n' +
      '           disco de este servidor. En un servidor en la nube ese disco\n' +
      '           se borra en cada despliegue, asi que las evidencias\n' +
      '           desapareceran. Completa CLOUDINARY_* en .env antes de\n' +
      '           publicar el proyecto.\n'
  );
}

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

function validarImagen(archivo) {
  if (!archivo) return 'No se recibio ninguna imagen.';
  if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
    return 'Solo se aceptan imagenes JPG, PNG o WEBP.';
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return 'La imagen no puede pesar mas de 5 MB.';
  }
  return null;
}

/**
 * Sube una imagen y devuelve donde quedo.
 *
 * Con Cloudinary configurado, el archivo viaja alla y nunca toca el disco de
 * este servidor. Sin configurar, se guarda en /uploads para poder desarrollar
 * sin cuenta; funciona igual, pero no sobrevive a un despliegue.
 */
async function subirImagen(archivo, { carpeta = 'sigtm/evidencias' } = {}) {
  const error = validarImagen(archivo);
  if (error) throw new Error(error);

  if (env.cloudinary.configurado) {
    const resultado = await new Promise((resolver, rechazar) => {
      const flujo = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          resource_type: 'image',
          // Las fotos de un taller salen del celular a 4000 px de ancho y
          // pesan varios megas. Nadie necesita esa resolucion para ver que se
          // cambio una pastilla de freno, y el cliente que las abre desde el
          // celular con datos, menos.
          transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto:good' }],
        },
        (err, res) => (err ? rechazar(err) : resolver(res))
      );
      flujo.end(archivo.buffer);
    });

    return {
      url: resultado.secure_url,
      // La miniatura la genera el propio proveedor a partir de la misma
      // imagen: no hay que subir dos archivos ni guardar dos copias.
      urlMiniatura: cloudinary.url(resultado.public_id, {
        secure: true,
        transformation: [{ width: 400, height: 300, crop: 'fill', quality: 'auto:eco' }],
      }),
      identificadorPublico: resultado.public_id,
    };
  }

  // ── Respaldo local ─────────────────────────────────────────────
  fs.mkdirSync(CARPETA_LOCAL, { recursive: true });
  const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[archivo.mimetype];
  const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
  fs.writeFileSync(path.join(CARPETA_LOCAL, nombre), archivo.buffer);

  const url = `${env.urlPublicaApi}/uploads/${nombre}`;
  return { url, urlMiniatura: url, identificadorPublico: null };
}

/**
 * Borra la imagen de donde este guardada.
 *
 * Nunca lanza: si el archivo ya no existe en el proveedor, la fila de la base
 * igual tiene que poder borrarse. Lo contrario deja evidencias imposibles de
 * quitar desde la aplicacion.
 */
async function borrarImagen({ identificadorPublico, url }) {
  try {
    if (identificadorPublico && env.cloudinary.configurado) {
      await cloudinary.uploader.destroy(identificadorPublico);
      return { borrada: true };
    }
    if (url && url.includes('/uploads/')) {
      const nombre = path.basename(new URL(url, 'http://local').pathname);
      const destino = path.join(CARPETA_LOCAL, nombre);
      // Se comprueba que el archivo quede DENTRO de la carpeta de subidas:
      // sin esto, un nombre con ".." podria borrar cualquier cosa del disco.
      if (destino.startsWith(CARPETA_LOCAL) && fs.existsSync(destino)) {
        fs.unlinkSync(destino);
      }
      return { borrada: true };
    }
    return { borrada: false, motivo: 'no habia nada que borrar' };
  } catch (error) {
    console.error(`[imagenes] No se pudo borrar el archivo: ${error.message}`);
    return { borrada: false, motivo: error.message };
  }
}

module.exports = {
  subirImagen,
  borrarImagen,
  validarImagen,
  TIPOS_PERMITIDOS,
  TAMANO_MAXIMO,
  CARPETA_LOCAL,
};
