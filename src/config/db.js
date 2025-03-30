const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Forzar el uso de IPv4 para evitar problemas de conexión con IPv6
  family: 4
});

module.exports = pool;