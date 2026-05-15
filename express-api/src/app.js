const cors = require('cors');
const express = require('express');
const session = require('express-session');
const { sessionSecret } = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/error-handler');

const app = express();

// Permite que Angular consuma la API conservando cookies de sesion.
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
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
    sameSite: 'lax'
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
