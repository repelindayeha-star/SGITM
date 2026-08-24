const { Router } = require('express');
const citaController = require('../controllers/cita.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  validarCrearCita,
  validarActualizarCita,
  validarCambiarEstadoCita,
  validarIdCita,
} = require('../validators/cita.validator');

const router = Router();

router.use(autenticar);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'),
  validarCrearCita,
  validarCampos,
  citaController.crear
);

router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  citaController.listar
);

router.get(
  '/:id',
  validarIdCita,
  validarCampos,
  citaController.obtenerPorId
);

router.get(
  '/cliente/:clienteId',
  citaController.listarPorCliente
);

router.patch(
  '/:id/estado',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCambiarEstadoCita,
  validarCampos,
  citaController.cambiarEstado
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'),
  validarActualizarCita,
  validarCampos,
  citaController.actualizar
);

router.delete(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarIdCita,
  validarCampos,
  citaController.eliminar
);

module.exports = router;