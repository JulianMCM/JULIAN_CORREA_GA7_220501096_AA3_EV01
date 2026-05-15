const { Router } = require('express');
const cart = require('../controllers/cart.controller');
const purchases = require('../controllers/purchases.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Carrito del usuario autenticado.
router.get('/cart', requireAuth, cart.listCart);
router.post('/cart/items', requireAuth, cart.addToCart);
router.delete('/cart/items', requireAuth, cart.removeFromCart);
router.delete('/cart', requireAuth, cart.clearCart);
router.post('/cart/purchase', requireAuth, purchases.buyCart);

module.exports = router;
