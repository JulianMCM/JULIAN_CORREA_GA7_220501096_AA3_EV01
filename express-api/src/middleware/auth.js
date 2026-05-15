function requireAuth(req, res, next) {
  // Las rutas privadas necesitan el id guardado durante el login.
  if (!req.session.userId) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado'
    });
  }

  return next();
}

module.exports = {
  requireAuth
};
