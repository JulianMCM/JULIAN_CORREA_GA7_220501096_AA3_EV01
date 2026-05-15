const { Router } = require('express');
const profile = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Perfil y listas personales del usuario autenticado.
router.get('/profile', requireAuth, profile.getProfile);

module.exports = router;
