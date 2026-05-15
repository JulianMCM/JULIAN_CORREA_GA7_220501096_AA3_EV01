function badRequest(message) {
  // Error 400: el cliente envio datos incompletos o invalidos.
  const error = new Error(message);
  error.statusCode = 400;
  error.publicMessage = message;
  return error;
}

function conflict(message) {
  // Error 409: la operacion choca con datos existentes, como email repetido.
  const error = new Error(message);
  error.statusCode = 409;
  error.publicMessage = message;
  return error;
}

function notFound(message) {
  // Error 404: el recurso pedido no existe.
  const error = new Error(message);
  error.statusCode = 404;
  error.publicMessage = message;
  return error;
}

module.exports = {
  badRequest,
  conflict,
  notFound
};
