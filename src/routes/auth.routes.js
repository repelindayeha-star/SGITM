const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const { validarRegistro, validarLogin } = require('../validators/auth.validator');

const router = Router();

router.post('/registro', validarRegistro, validarCampos, authController.registrar);
router.post('/login', validarLogin, validarCampos, authController.login);

// Ruta de prueba protegida: requiere un token JWT válido en el header Authorization.
router.get('/perfil', autenticar, (req, res) => {
  res.json({ exito: true, data: req.usuario });
});

module.exports = router;