const { query, transaction } = require('../config/db');
const { badRequest } = require('../utils/http');

async function getOrCreateCart(connection, userId) {
  // El carrito se crea bajo demanda la primera vez que el usuario agrega un juego.
  const [carts] = await connection.execute(
    'SELECT IdCarrito FROM Carrito WHERE IdUsuario = ?',
    [userId]
  );

  if (carts.length > 0) {
    return Number(carts[0].IdCarrito);
  }

  const [result] = await connection.execute(
    'INSERT INTO Carrito (IdUsuario) VALUES (?)',
    [userId]
  );

  return Number(result.insertId);
}

async function listCart(req, res, next) {
  try {
    // Lista los juegos asociados al carrito del usuario autenticado.
    const rows = await query(
      `SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio
       FROM Carrito c
       INNER JOIN Carrito_Videojuego cv ON c.IdCarrito = cv.IdCarrito
       INNER JOIN Videojuego v ON cv.IdVideojuego = v.IdVideojuego
       WHERE c.IdUsuario = ?`,
      [req.session.userId]
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function addToCart(req, res, next) {
  try {
    // Inserta el juego evitando duplicados con INSERT IGNORE.
    const gameId = Number(req.body.idVideojuego || 0);
    if (gameId <= 0) {
      throw badRequest('ID de videojuego requerido.');
    }

    await transaction(async (connection) => {
      const cartId = await getOrCreateCart(connection, req.session.userId);
      await connection.execute(
        'INSERT IGNORE INTO Carrito_Videojuego (IdCarrito, IdVideojuego) VALUES (?, ?)',
        [cartId, gameId]
      );
    });

    return res.json({ status: 'success' });
  } catch (error) {
    return next(error);
  }
}

async function removeFromCart(req, res, next) {
  try {
    // Elimina un solo juego del carrito actual.
    const gameId = Number(req.body.idVideojuego || 0);
    if (gameId <= 0) {
      throw badRequest('ID de videojuego requerido.');
    }

    await query(
      `DELETE cv FROM Carrito_Videojuego cv
       INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
       WHERE c.IdUsuario = ? AND cv.IdVideojuego = ?`,
      [req.session.userId, gameId]
    );

    return res.json({ status: 'success' });
  } catch (error) {
    return next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    // Vacia todos los juegos del carrito del usuario.
    await query(
      `DELETE cv FROM Carrito_Videojuego cv
       INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
       WHERE c.IdUsuario = ?`,
      [req.session.userId]
    );

    return res.json({ status: 'success' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCart,
  addToCart,
  removeFromCart,
  clearCart
};
