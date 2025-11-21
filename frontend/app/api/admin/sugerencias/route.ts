import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'toki1801',
  database: process.env.DB_NAME || 'gofish',
  charset: 'utf8mb4'
}

export async function GET() {
  let connection
  
  try {
    connection = await mysql.createConnection(dbConfig)
    
    // Verificar si la columna estado existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'sugerencias' 
      AND COLUMN_NAME = 'estado'
    `, [dbConfig.database]) as any[]
    
    let query = ''
    if (Array.isArray(columns) && columns.length > 0) {
      // Si existe la columna estado
      query = `
        SELECT id, texto, imagen, fecha, estado
        FROM sugerencias 
        ORDER BY fecha DESC
      `
    } else {
      // Si no existe, usar un valor por defecto
      query = `
        SELECT id, texto, imagen, fecha, 'pendiente' as estado
        FROM sugerencias 
        ORDER BY fecha DESC
      `
    }
    
    const [sugerencias] = await connection.execute(query)
    
    return NextResponse.json(sugerencias)
    
  } catch (error) {
    console.error('Error al obtener sugerencias:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}