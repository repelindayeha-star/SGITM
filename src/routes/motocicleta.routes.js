const { Router } = require('express');
const motocicletaController = require('../controllers/motocicleta.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  validarCrearMotocicleta,
  validarActualizarMotocicleta,
  validarIdMotocicleta,
} = require('../validators/motocicleta.validator');

const router = Router();

router.use(autenticar);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCrearMotocicleta,
  validarCampos,
  motocicletaController.crear
);

router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  motocicletaController.listar
);

router.get(
  '/:id',
  validarIdMotocicleta,
  validarCampos,
  motocicletaController.obtenerPorId
);

router.get(
  '/cliente/:clienteId',
  motocicletaController.listarPorCliente
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarActualizarMotocicleta,
  validarCampos,
  motocicletaController.actualizar
);

router.delete(
  '/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarIdMotocicleta,
  validarCampos,
  motocicletaController.eliminar
);

module.exports = router;