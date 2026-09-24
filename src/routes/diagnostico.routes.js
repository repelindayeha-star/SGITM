const { Router } = require('express');
const diagnosticoController = require('../controllers/diagnostico.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  soloOrdenAsignadaSiMecanico,
  ordenDeDiagnostico,
  ordenDeDiagnosticoEnCuerpo,
  ordenDeItemCotizacion,
} = require('../middlewares/propiedad.middleware');
const {
  validarCrearDiagnostico,
  validarActualizarDiagnostico,
  validarAgregarItem,
  validarIdDiagnostico,
  validarOrdenId,
  validarIdItem,
} = require('../validators/diagnostico.validator');

const router = Router();

router.use(autenticar);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarCrearDiagnostico,
  validarCampos,
  // La orden llega en el cuerpo, no en la URL: sin esto un mecanico podia
  // diagnosticar y cotizar la orden de un companero.
  soloOrdenAsignadaSiMecanico((req) => req.body.ordenId),
  diagnosticoController.crearDiagnostico
);

// La cotizacion es informacion del taller. El cliente ve la suya en su
// portal, que se la entrega junto con la orden; esta ruta no tenia ningun
// control de rol, asi que cualquier cuenta autenticada leia el diagnostico
// de cualquier orden.
router.get(
  '/orden/:ordenId',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarOrdenId,
  validarCampos,
  soloOrdenAsignadaSiMecanico((req) => req.params.ordenId),
  diagnosticoController.obtenerPorOrdenId
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarActualizarDiagnostico,
  validarCampos,
  soloOrdenAsignadaSiMecanico(ordenDeDiagnostico('id')),
  diagnosticoController.actualizarDiagnostico
);

router.get(
  '/:id/total',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarIdDiagnostico,
  validarCampos,
  soloOrdenAsignadaSiMecanico(ordenDeDiagnostico('id')),
  diagnosticoController.calcularTotal
);

// El diagnostico llega en el cuerpo, no en la URL: sin esto un mecanico
// podia meterle lineas a la cotizacion de un companero.
router.post(
  '/items',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarAgregarItem,
  validarCampos,
  soloOrdenAsignadaSiMecanico(ordenDeDiagnosticoEnCuerpo('diagnosticoId')),
  diagnosticoController.agregarItem
);

router.delete(
  '/items/:id',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarIdItem,
  validarCampos,
  soloOrdenAsignadaSiMecanico(ordenDeItemCotizacion('id')),
  diagnosticoController.eliminarItem
);

module.exports = router;