const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Forzar el uso de IPv4 para evitar problemas de conexión con IPv6
  family: 4,
  // Configuración para el Transaction Pooler de Supabase
  max: 10, // Limitar el número máximo de conexiones
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 5000 // Tiempo de espera para establecer conexión
});

module.exports = pool;