const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');

const router = Router();

router.use(autenticar);

router.get(
  '/resumen',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  dashboardController.obtenerResumen
);

module.exports = router;