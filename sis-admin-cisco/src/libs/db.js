import mysql from 'serverless-mysql';

// Configuración de la conexión
const db = mysql({
  config: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '26052004',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'cisco_academy',
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

// Función para consultas con paginación
export const queryWithPagination = async (baseQuery, values = [], page = 1, limit = 10) => {
  try {
    // Consulta para contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`
    const [countResult] = await db.query(countQuery, values)
    const total = countResult.total

    // Consulta con paginación
    const offset = (page - 1) * limit
    const paginatedQuery = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`
    const results = await db.query(paginatedQuery, values)

    await db.end()

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }
  } catch (e) {
    console.error("Paginated query error:", e)
    throw new Error(`Error executing paginated query: ${e.message}`)
  }
}

export default db;