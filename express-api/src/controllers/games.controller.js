const { query } = require('../config/db');

// Convierte filtros recibidos como "accion,rpg" en arreglo.
function asList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapGame(row) {
  // Adapta nombres de columnas MySQL al contrato que consume Angular.
  return {
    id: Number(row.IdVideojuego),
    nombre: row.nombre,
    fecha: row.fecha,
    valoraciones: Number(row.ValoracionPromedio || 0),
    precio: Number(row.precio || 0),
    genero: row.etiqueta,
    idioma: row.Idioma ? String(row.Idioma).split(',') : ['espanol', 'ingles'],
    so: row.SO ? String(row.SO).split(',') : ['windows'],
    paisDesarrollador: row.paisDesarrollador,
    desarrollador: row.desarrollador,
    descripcion: row.descripcion
  };
}

async function listGames(req, res, next) {
  try {
    // Los filtros llegan por query string: /backend/games?genero=rpg&orden=precio.
    const userId = req.session.userId ? Number(req.session.userId) : null;
    const minPrecio = Number(req.query.minPrecio || 0);
    const maxPrecio = Number(req.query.maxPrecio || 100);
    const orden = String(req.query.orden || 'nombre');
    const busqueda = String(req.query.busqueda || '').trim();

    let sql = `SELECT v.IdVideojuego, v.Titulo AS nombre, v.FechaLanzamiento AS fecha,
                      v.Genero AS etiqueta, v.Precio AS precio, v.Idioma, v.SO,
                      v.ValoracionPromedio, d.PaisOrigen AS paisDesarrollador,
                      d.Nombre AS desarrollador, v.Descripcion AS descripcion
               FROM Videojuego v
               LEFT JOIN Desarrollador d ON v.IdDesarrollador = d.IdDesarrollador`;
    const where = [];
    const params = [];

    // WHERE y parametros se construyen por separado para mantener consultas seguras.
    if (minPrecio > 0 || maxPrecio < 100) {
      where.push('v.Precio BETWEEN ? AND ?');
      params.push(minPrecio, maxPrecio);
    }

    for (const [column, rawValue] of [
      ['v.Genero', req.query.genero],
      ['v.Idioma', req.query.idioma],
      ['v.SO', req.query.so]
    ]) {
      const values = asList(rawValue);
      if (values.length > 0) {
        where.push(`(${values.map(() => `${column} LIKE ?`).join(' OR ')})`);
        params.push(...values.map((value) => `%${value}%`));
      }
    }

    if (busqueda) {
      where.push('v.Titulo LIKE ?');
      params.push(`%${busqueda}%`);
    }

    if (userId && !busqueda) {
      where.push('v.IdVideojuego NOT IN (SELECT IdVideojuego FROM Ignorado WHERE IdUsuario = ?)');
      params.push(userId);
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }

    const orders = {
      precio: 'v.Precio ASC',
      fecha: 'v.FechaLanzamiento DESC',
      valoraciones: 'v.Precio DESC',
      nombre: 'v.Titulo ASC'
    };
    sql += ` ORDER BY ${orders[orden] || orders.nombre}`;

    // Devuelve solo JSON, sin HTML ni vistas del servidor.
    const rows = await query(sql, params);
    return res.json(rows.map(mapGame));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listGames
};
