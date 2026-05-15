const { Router } = require('express');
const auth = require('../controllers/auth.controller');

const router = Router();

// Rutas de autenticacion y sesion.
router.get('/session', auth.sessionStatus);
router.post('/auth/login', auth.login);
router.post('/auth/register', auth.register);
router.get('/auth/logout', auth.logout);

module.exports = router;
