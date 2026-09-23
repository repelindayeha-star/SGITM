const { body, param } = require('express-validator');

// El telefono solo comprobaba la longitud, asi que "abcdefgh" pasaba y se
// guardaba como telefono de un cliente. Es justo el dato con el que el taller
// llama cuando la moto esta lista: si entra basura, la llamada no se hace.
//
// Se normaliza a digitos antes de validar, porque la gente escribe
// "300 123 4567", "+57 300-1234567" o "(604) 1234567" y las tres son numeros
// validos. Lo que se guarda son los digitos.
const soloDigitos = (valor) => String(valor || '').replace(/\D/g, '');
const MENSAJE_TELEFONO = 'El telefono debe tener entre 7 y 15 digitos. Se aceptan espacios, guiones y +.';
const telefonoValido = (valor) => {
  const d = soloDigitos(valor);
  return d.length >= 7 && d.length <= 15;
};

const validarCrearCliente = [
  // La recepcionista escribe nombre y correo. NO escribe contrasena: la
  // cuenta nace sin una utilizable y el cliente elige la suya con el codigo
  // que le llega al correo. Asi nadie del taller conoce la clave de nadie.
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio.')
    .customSanitizer(soloDigitos)
    .custom(telefonoValido).withMessage(MENSAJE_TELEFONO),

  body('direccion')
    .optional()
    .trim(),
];

const validarActualizarCliente = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('telefono')
    .optional({ values: 'falsy' })
    .trim()
    .customSanitizer(soloDigitos)
    .custom(telefonoValido).withMessage(MENSAJE_TELEFONO),
  body('direccion').optional().trim(),
];

const validarIdCliente = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = { validarCrearCliente, validarActualizarCliente, validarIdCliente };