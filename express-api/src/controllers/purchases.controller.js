const { query, transaction } = require('../config/db');
const { getOrCreateLibrary } = require('../services/library.service');
const { badRequest } = require('../utils/http');

async function buyGame(req, res, next) {
  try {
    // Compra directa de un juego desde el catalogo o el detalle.
    const gameId = Number(req.body.idVideojuego || req.body.id || req.params.id || 0);
    const price = req.body.precio === undefined ? null : Number(req.body.precio);

    if (gameId <= 0 || price === null || !Number.isFinite(price)) {
      throw badRequest('Datos incompletos.');
    }

    await transaction(async (connection) => {
      // La compra, su detalle y la biblioteca deben quedar consistentes.
      const [purchase] = await connection.execute(
        "INSERT INTO Compra (IdUsuario, MetodoPago, MontoTotal) VALUES (?, 'Tarjeta', ?)",
        [req.session.userId, price]
      );

      await connection.execute(
        'INSERT INTO Compra_Videojuego (IdCompra, IdVideojuego) VALUES (?, ?)',
        [purchase.insertId, gameId]
      );

      const libraryId = await getOrCreateLibrary(connection, req.session.userId);
      await connection.execute(
        'INSERT IGNORE INTO Biblioteca_Videojuego (IdBiblioteca, IdVideojuego) VALUES (?, ?)',
        [libraryId, gameId]
      );
    });

    return res.json({
      status: 'success',
      message: 'Compra realizada correctamente.'
    });
  } catch (error) {
    return next(error);
  }
}

async function buyCart(req, res, next) {
  try {
    await transaction(async (connection) => {
      // Toma todos los juegos del carrito y calcula el total antes de registrar la compra.
      const [games] = await connection.execute(
        `SELECT v.IdVideojuego, v.Precio
         FROM Carrito c
         INNER JOIN Carrito_Videojuego cv ON c.IdCarrito = cv.IdCarrito
         INNER JOIN Videojuego v ON cv.IdVideojuego = v.IdVideojuego
         WHERE c.IdUsuario = ?`,
        [req.session.userId]
      );

      if (games.length === 0) {
        throw badRequest('El carrito está vacío');
      }

      const total = games.reduce((sum, game) => sum + Number(game.Precio || 0), 0);
      const [purchase] = await connection.execute(
        "INSERT INTO Compra (IdUsuario, MetodoPago, MontoTotal) VALUES (?, 'Carrito', ?)",
        [req.session.userId, total]
      );
      const libraryId = await getOrCreateLibrary(connection, req.session.userId);

      // Cada juego comprado queda relacionado con la compra y con la biblioteca.
      for (const game of games) {
        await connection.execute(
          'INSERT INTO Compra_Videojuego (IdCompra, IdVideojuego) VALUES (?, ?)',
          [purchase.insertId, game.IdVideojuego]
        );
        await connection.execute(
          'INSERT IGNORE INTO Biblioteca_Videojuego (IdBiblioteca, IdVideojuego) VALUES (?, ?)',
          [libraryId, game.IdVideojuego]
        );
      }

      await connection.execute(
        `DELETE cv FROM Carrito_Videojuego cv
         INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
         WHERE c.IdUsuario = ?`,
        [req.session.userId]
      );
    });

    return res.json({
      status: 'success',
      message: 'Compra realizada con éxito'
    });
  } catch (error) {
    return next(error);
  }
}

async function verifyLibrary(req, res, next) {
  try {
    // Esta ruta tambien responde false para visitantes no autenticados.
    if (!req.session.userId) {
      return res.json({ enBiblioteca: false });
    }

    const gameId = Number(req.query.idVideojuego || req.params.id || 0);
    if (gameId <= 0) {
      return res.json({ enBiblioteca: false });
    }

    const rows = await query(
      `SELECT bv.IdVideojuego
       FROM Biblioteca_Videojuego bv
       INNER JOIN Biblioteca b ON bv.IdBiblioteca = b.IdBiblioteca
       WHERE b.IdUsuario = ? AND bv.IdVideojuego = ?`,
      [req.session.userId, gameId]
    );

    return res.json({ enBiblioteca: rows.length > 0 });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  buyGame,
  buyCart,
  verifyLibrary
};
