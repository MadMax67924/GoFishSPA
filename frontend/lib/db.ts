import mysql from 'mysql2/promise'

const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "toki1801",
    database: process.env.DB_NAME || "gofish",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
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