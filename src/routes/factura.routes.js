const { Router } = require('express');
const facturaController = require('../controllers/factura.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  validarCrearFactura,
  validarIdFactura,
  validarOrdenIdFactura,
} = require('../validators/factura.validator');

const router = Router();

router.use(autenticar);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCrearFactura,
  validarCampos,
  facturaController.crear
);

router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  facturaController.listar
);

router.get(
  '/orden/:ordenId',
  validarOrdenIdFactura,
  validarCampos,
  facturaController.obtenerPorOrdenId
);

router.get(
  '/:id',
  validarIdFactura,
  validarCampos,
  facturaController.obtenerPorId
);

module.exports = router;