const { body } = require('express-validator');

const MOMENTOS = ['ANTES', 'DURANTE', 'DESPUES'];

// Estos campos viajan junto a la imagen, en un formulario multiparte, asi que
// la validacion corre DESPUES de recibir el archivo. Es el unico orden
// posible: antes de que multer lea el cuerpo, req.body todavia esta vacio.
const validarEvidencia = [
  body('momento')
    .optional({ values: 'falsy' })
    .isIn(MOMENTOS)
    .withMessage(`El momento debe ser uno de: ${MOMENTOS.join(', ')}.`),

  body('descripcion')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede pasar de 200 caracteres.'),
];

module.exports = { validarEvidencia, MOMENTOS };
