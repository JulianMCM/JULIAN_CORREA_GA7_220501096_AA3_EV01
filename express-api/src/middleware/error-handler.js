function notFound(req, res) {
  // Respuesta uniforme cuando el cliente llama una ruta inexistente.
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  // Centraliza errores para que los controladores no repitan res.status(...).
  return res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.publicMessage || 'Error interno del servidor.',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
}

module.exports = {
  notFound,
  errorHandler
};
