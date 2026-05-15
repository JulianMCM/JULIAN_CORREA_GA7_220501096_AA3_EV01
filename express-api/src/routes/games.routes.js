const { Router } = require('express');
const games = require('../controllers/games.controller');
const purchases = require('../controllers/purchases.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Recurso principal: catalogo de videojuegos.
router.get('/games', games.listGames);
router.post('/games/:id/purchase', requireAuth, purchases.buyGame);
router.get('/games/:id/library-status', purchases.verifyLibrary);

module.exports = router;
