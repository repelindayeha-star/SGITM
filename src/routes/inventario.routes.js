const { Router } = require('express');
const inventarioController = require('../controllers/inventario.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const { soloOrdenAsignadaSiMecanico } = require('../middlewares/propiedad.middleware');
const {
  validarCrearRepuesto,
  validarActualizarRepuesto,
  validarMovimiento,
  validarIdRepuesto,
  validarOrdenIdConsumo,
} = require('../validators/inventario.validator');

const router = Router();

router.use(autenticar);

// Repuestos
router.post(
  '/repuestos',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCrearRepuesto,
  validarCampos,
  inventarioController.crearRepuesto
);

router.get(
  '/repuestos',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  inventarioController.listarRepuestos
);

router.get(
  '/repuestos/stock-bajo',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  inventarioController.listarStockBajo
);

router.get(
  '/repuestos/:id',
  validarIdRepuesto,
  validarCampos,
  inventarioController.obtenerRepuestoPorId
);

router.put(
  '/repuestos/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarActualizarRepuesto,
  validarCampos,
  inventarioController.actualizarRepuesto
);

router.delete(
  '/repuestos/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarIdRepuesto,
  validarCampos,
  inventarioController.eliminarRepuesto
);

router.get(
  '/repuestos/:id/movimientos',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarIdRepuesto,
  validarCampos,
  inventarioController.listarMovimientosPorRepuesto
);

// Movimientos
router.post(
  '/movimientos',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarMovimiento,
  validarCampos,
  inventarioController.registrarMovimiento
);

router.get(
  '/movimientos',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  inventarioController.listarMovimientos
);

// Consumo por orden de trabajo
//
// El mecanico es quien sabe que repuestos gasto, asi que es quien los
// descuenta, desde la orden que esta atendiendo. Recepcion tambien, porque
// mueve el almacen. El administrador no: en este sistema supervisa, no opera
// -- puede consultar el consumo (GET), no provocarlo.
// `soloOrdenAsignadaSiMecanico` impide que un mecanico descuente contra la
// orden de un companero.
router.post(
  '/ordenes/:ordenId/consumo',
  autorizarRoles('RECEPCIONISTA', 'MECANICO'),
  validarOrdenIdConsumo,
  validarCampos,
  soloOrdenAsignadaSiMecanico((req) => req.params.ordenId),
  inventarioController.descontarRepuestosDeOrden
);

router.get(
  '/ordenes/:ordenId/consumo',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarOrdenIdConsumo,
  validarCampos,
  soloOrdenAsignadaSiMecanico((req) => req.params.ordenId),
  inventarioController.listarConsumoDeOrden
);

module.exports = router;    