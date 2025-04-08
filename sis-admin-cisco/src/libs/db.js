import mysql from 'serverless-mysql';

// Configuración de la conexión
const db = mysql({
  config: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '26052004',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'academia_cisco',
    // Opciones adicionales recomendadas
    connectionLimit: 10, // Número máximo de conexiones
    connectTimeout: 10000, // 10 segundos de timeout
    charset: 'utf8mb4' // Soporte para emojis y caracteres especiales
  }
});

// Función wrapper para ejecutar consultas con manejo de errores
export const query = async (q, values) => {
  try {
    const results = await db.query(q, values);
    await db.end();
    return results;
  } catch (e) {
    console.error('Database error:', e);
    throw new Error('Error executing database query');
  }
};

export default db;