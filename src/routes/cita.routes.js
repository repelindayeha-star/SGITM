const { Router } = require('express');
const citaController = require('../controllers/cita.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  soloPropioSiCliente,
  duenoDesdeParametro,
  duenoDeCita,
} = require('../middlewares/propiedad.middleware');
const {
  validarCrearCita,
  validarActualizarCita,
  validarCambiarEstadoCita,
  validarIdCita,
} = require('../validators/cita.validator');

const router = Router();

router.use(autenticar);

// El CLIENTE puede agendar, pero solo para si mismo: el clienteId viene en el
// cuerpo, asi que el dueno se resuelve desde ahi y no desde la URL.
router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'),
  validarCrearCita,
  validarCampos,
  soloPropioSiCliente((req) => req.body.clienteId),
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
  soloPropioSiCliente(duenoDeCita),
  citaController.obtenerPorId
);

router.get(
  '/cliente/:clienteId',
  soloPropioSiCliente(duenoDesdeParametro('clienteId')),
  citaController.listarPorCliente
);

router.patch(
  '/:id/estado',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCambiarEstadoCita,
  validarCampos,
  citaController.cambiarEstado
);

// El CLIENTE tiene permiso para reprogramar, pero solo SU cita.
// Antes podia modificar la de cualquiera.
router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'),
  validarActualizarCita,
  validarCampos,
  soloPropioSiCliente(duenoDeCita),
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
