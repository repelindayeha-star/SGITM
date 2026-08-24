const { Router } = require('express');
const diagnosticoController = require('../controllers/diagnostico.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
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
  diagnosticoController.crearDiagnostico
);

router.get(
  '/orden/:ordenId',
  validarOrdenId,
  validarCampos,
  diagnosticoController.obtenerPorOrdenId
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarActualizarDiagnostico,
  validarCampos,
  diagnosticoController.actualizarDiagnostico
);

router.get(
  '/:id/total',
  validarIdDiagnostico,
  validarCampos,
  diagnosticoController.calcularTotal
);

router.post(
  '/items',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarAgregarItem,
  validarCampos,
  diagnosticoController.agregarItem
);

router.delete(
  '/items/:id',
  autorizarRoles('ADMINISTRADOR', 'MECANICO'),
  validarIdItem,
  validarCampos,
  diagnosticoController.eliminarItem
);

module.exports = router;