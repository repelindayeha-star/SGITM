const { Router } = require('express');
const facturaController = require('../controllers/factura.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  soloPropioSiCliente,
  duenoDeFactura,
  duenoDeOrdenEnParametro,
} = require('../middlewares/propiedad.middleware');
const {
  validarCrearFactura,
  validarIdFactura,
  validarOrdenIdFactura,
} = require('../validators/factura.validator');

// Quien puede tocar una factura: el taller la emite y la consulta; el cliente
// solo consulta la suya. El MECANICO queda fuera a proposito -- arregla motos,
// no cobra: ver lo que se le cobro a otro cliente no es parte de su trabajo.
const VE_FACTURAS = ['ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'];

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

// Antes estas dos rutas solo pedian sesion valida: cambiando el UUID de la
// URL, cualquier usuario autenticado leia la factura de otro cliente.
router.get(
  '/orden/:ordenId',
  autorizarRoles(...VE_FACTURAS),
  validarOrdenIdFactura,
  validarCampos,
  soloPropioSiCliente(duenoDeOrdenEnParametro('ordenId')),
  facturaController.obtenerPorOrdenId
);

router.get(
  '/:id',
  autorizarRoles(...VE_FACTURAS),
  validarIdFactura,
  validarCampos,
  soloPropioSiCliente(duenoDeFactura),
  facturaController.obtenerPorId
);

module.exports = router;