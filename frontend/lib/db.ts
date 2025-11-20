import mysql from 'mysql2/promise'

// Validar variables de entorno en producción
if (!process.env.DB_HOST) {
  throw new Error("DATABASE ENV VARIABLES NOT FOUND")
}

const dbConfig = {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
}

const pool = mysql.createPool(dbConfig)

export async function query(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}