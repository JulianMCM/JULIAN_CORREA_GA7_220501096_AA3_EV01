const mysql = require('mysql2/promise');
const { db } = require('./env');

// Pool reutilizable: evita abrir una conexion nueva por cada consulta.
const pool = mysql.createPool(db);

// Ejecuta consultas sencillas con parametros para reducir riesgo de SQL injection.
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Ejecuta varias operaciones como una sola unidad: commit si todo sale bien,
// rollback si algo falla.
async function transaction(work) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query,
  transaction
};
