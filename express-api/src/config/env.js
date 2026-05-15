const dotenv = require('dotenv');

dotenv.config();

// Convierte variables numericas del .env y usa un valor seguro si faltan.
const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Configuracion central de la API y la base de datos.
module.exports = {
  port: toInt(process.env.PORT, 3000),
  sessionSecret: process.env.SESSION_SECRET || 'playcore-dev-session-secret',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'playcoredb',
    port: toInt(process.env.DB_PORT, 3308),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  }
};
