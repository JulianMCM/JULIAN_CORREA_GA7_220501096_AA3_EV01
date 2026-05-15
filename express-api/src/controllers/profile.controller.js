const { query } = require('../config/db');
const { notFound } = require('../utils/http');

async function listProfileGames(sql, userId) {
  // Helper pequeno para ejecutar las consultas de listas del perfil.
  return query(sql, [userId]);
}

async function getProfile(req, res, next) {
  try {
    // Carga datos basicos del usuario autenticado.
    const users = await query(
      'SELECT NombreUsuario, Correo, Pais FROM Usuario WHERE IdUsuario = ?',
      [req.session.userId]
    );
    const user = users[0];

    if (!user) {
      throw notFound('Usuario no encontrado');
    }

    // Las listas se consultan por separado porque cada una vive en una tabla distinta.
    const videojuegosAdquiridos = await listProfileGames(
      `SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero,
              v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, bv.FechaAdicion
       FROM Biblioteca_Videojuego bv
       INNER JOIN Biblioteca b ON bv.IdBiblioteca = b.IdBiblioteca
       INNER JOIN Videojuego v ON bv.IdVideojuego = v.IdVideojuego
       WHERE b.IdUsuario = ?
       ORDER BY bv.FechaAdicion DESC`,
      req.session.userId
    );

    const deseados = await listProfileGames(
      `SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero,
              v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, d.FechaAgregado
       FROM Deseado d
       INNER JOIN Videojuego v ON d.IdVideojuego = v.IdVideojuego
       WHERE d.IdUsuario = ?
       ORDER BY d.FechaAgregado DESC`,
      req.session.userId
    );

    const seguidos = await listProfileGames(
      `SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero,
              v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, s.FechaAgregado
       FROM Seguido s
       INNER JOIN Videojuego v ON s.IdVideojuego = v.IdVideojuego
       WHERE s.IdUsuario = ?
       ORDER BY s.FechaAgregado DESC`,
      req.session.userId
    );

    const ignorados = await listProfileGames(
      `SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero,
              v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, i.FechaAgregado
       FROM Ignorado i
       INNER JOIN Videojuego v ON i.IdVideojuego = v.IdVideojuego
       WHERE i.IdUsuario = ?
       ORDER BY i.FechaAgregado DESC`,
      req.session.userId
    );

    return res.json({
      usuario: user,
      videojuegosAdquiridos,
      deseados,
      seguidos,
      ignorados
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile
};
