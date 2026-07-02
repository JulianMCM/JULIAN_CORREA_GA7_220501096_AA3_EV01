const cors = require('cors');
const express = require('express');
const session = require('express-session');
const { frontendOrigins, isProduction, sessionSecret } = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/error-handler');

const app = express();

if (isProduction) {
  app.set('trust proxy', 1);
}

// Permite que Angular consuma la API conservando cookies de sesion.
app.use(cors({
  origin: frontendOrigins,
  credentials: true
}));

// Interpreta cuerpos JSON y habilita sesiones para login/carrito/perfil.
app.use(express.json());
app.use(session({
  name: 'playcore.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
  }
}));

// Endpoint simple para comprobar que el servidor esta encendido.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Todas las rutas de la API quedan agrupadas bajo /backend.
app.use('/backend', routes);

// Si ninguna ruta coincide, responde 404; cualquier error cae al handler central.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
