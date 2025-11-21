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

export async function PUT(request: NextRequest) {
  let connection
  
  try {
    const body = await request.json()
    const { id, estado } = body
    
    if (!id || !estado) {
      return NextResponse.json(
        { error: 'ID y estado son requeridos' },
        { status: 400 }
      )
    }
    
    const estadosPermitidos = ['pendiente', 'revisar_despues', 'aprobada', 'rechazada']  // ← Actualizado
    if (!estadosPermitidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }
    
    connection = await mysql.createConnection(dbConfig)
    
    // Verificar si existe la columna estado
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'sugerencias' 
      AND COLUMN_NAME = 'estado'
    `, [dbConfig.database]) as any[]
    
    if (Array.isArray(columns) && columns.length === 0) {
      // Agregar la columna estado si no existe
      await connection.execute(`
        ALTER TABLE sugerencias 
        ADD COLUMN estado ENUM('pendiente', 'revisada', 'aprobada', 'rechazada') 
        DEFAULT 'pendiente'
      `)
    }
    
    // Actualizar el estado de la sugerencia
    const [result] = await connection.execute(
      'UPDATE sugerencias SET estado = ? WHERE id = ?',
      [estado, id]
    ) as any[]
    
    if (result && typeof result === 'object' && 'affectedRows' in result && result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Sugerencia no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Sugerencia ${estado} correctamente` 
    })
    
  } catch (error) {
    console.error('Error al actualizar estado:', error)
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