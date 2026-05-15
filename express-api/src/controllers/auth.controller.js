const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { badRequest, conflict, notFound } = require('../utils/http');

// PHP genera hashes $2y$; bcryptjs espera $2b$ para poder verificarlos.
function normalizeBcryptHash(hash) {
  return typeof hash === 'string' ? hash.replace(/^\$2y\$/, '$2b$') : '';
}

async function sessionStatus(req, res) {
  // Angular llama esta ruta al cargar para saber si hay una sesion activa.
  if (!req.session.username) {
    return res.json({ status: 'no-session' });
  }

  return res.json({
    status: 'ok',
    usuario: req.session.username
  });
}

async function login(req, res, next) {
  try {
    // Valida credenciales, compara hash y guarda datos minimos en la sesion.
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!email || !password) {
      throw badRequest('Correo y contraseña son obligatorios.');
    }

    const users = await query(
      'SELECT IdUsuario, NombreUsuario, Contrasena FROM Usuario WHERE Correo = ?',
      [email]
    );
    const user = users[0];

    if (!user) {
      throw notFound('Usuario no encontrado.');
    }

    const isValid = await bcrypt.compare(password, normalizeBcryptHash(user.Contrasena));
    if (!isValid) {
      const error = new Error('Contraseña incorrecta.');
      error.statusCode = 401;
      error.publicMessage = 'Contraseña incorrecta.';
      throw error;
    }

    req.session.userId = Number(user.IdUsuario);
    req.session.username = user.NombreUsuario;

    return res.json({ status: 'success' });
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  try {
    // Normaliza entrada del formulario antes de validar reglas de negocio.
    const nombreUsuario = String(req.body.nombreUsuario || '').trim();
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');
    const pais = String(req.body.pais || '').trim();

    if (!nombreUsuario || !email || !password || !pais) {
      throw badRequest('Todos los campos son obligatorios.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw badRequest('Correo electrónico inválido.');
    }

    if (password.length < 6) {
      throw badRequest('La contraseña debe tener mínimo 6 caracteres.');
    }

    if (nombreUsuario.length < 3) {
      throw badRequest('El nombre de usuario debe tener al menos 3 caracteres.');
    }

    const emailMatches = await query('SELECT IdUsuario FROM Usuario WHERE Correo = ?', [email]);
    if (emailMatches.length > 0) {
      throw conflict('El correo ya está registrado.');
    }

    const userMatches = await query('SELECT IdUsuario FROM Usuario WHERE NombreUsuario = ?', [nombreUsuario]);
    if (userMatches.length > 0) {
      throw conflict('El nombre de usuario ya está en uso.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Nunca se guarda la contrasena original, solo el hash.
    await query(
      'INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, Pais) VALUES (?, ?, ?, ?)',
      [nombreUsuario, email, passwordHash, pais]
    );

    return res.status(201).json({ status: 'success' });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res, next) {
  // Destruye la sesion del servidor y deja al cliente sin usuario activo.
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    return res.json({
      status: 'success',
      message: 'Sesión cerrada correctamente.'
    });
  });
}

module.exports = {
  sessionStatus,
  login,
  register,
  logout
};
