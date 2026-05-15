const { Router } = require('express');
const authRoutes = require('./auth.routes');
const cartRoutes = require('./cart.routes');
const gamesRoutes = require('./games.routes');
const profileRoutes = require('./profile.routes');

const router = Router();

// Agrupa los modulos de rutas para montarlos juntos desde app.js.
router.use(authRoutes);
router.use(gamesRoutes);
router.use(cartRoutes);
router.use(profileRoutes);

module.exports = router;
