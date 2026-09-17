const multer = require('multer');
const AppError = require('../utils/AppError');
const { TIPOS_PERMITIDOS, TAMANO_MAXIMO } = require('../services/almacenamiento.service');

// La imagen se recibe EN MEMORIA, no en disco.
//
// Con Cloudinary el archivo nunca tiene que tocar el disco de este servidor:
// llega, se reenvia y se olvida. Escribirlo primero solo dejaria basura que
// alguien tendria que limpiar, y en un servidor en la nube esa carpeta se
// borra sola en cada despliegue de todos modos.
const almacen = multer.memoryStorage();

const subida = multer({
  storage: almacen,
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
  fileFilter: (req, archivo, siguiente) => {
    if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) return siguiente(null, true);
    // Se rechaza aqui, antes de leer el cuerpo entero: no tiene sentido
    // transferir cinco megas de un archivo que se va a descartar.
    siguiente(new AppError('Solo se aceptan imagenes JPG, PNG o WEBP.', 400));
  },
});

/**
 * Recibe una imagen del campo indicado y traduce los errores de multer a
 * mensajes que una persona pueda entender.
 */
function recibirImagen(campo = 'imagen') {
  const manejador = subida.single(campo);

  return (req, res, next) => {
    manejador(req, res, (error) => {
      if (!error) return next();

      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('La imagen no puede pesar mas de 5 MB.', 400));
      }
      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Envia una sola imagen por peticion.', 400));
      }
      return next(error instanceof AppError ? error : new AppError(error.message, 400));
    });
  };
}

module.exports = recibirImagen;
