import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gofish'
})

// DELETE /api/wishlist/clear - Limpiar toda la wishlist del usuario
export async function DELETE(request: NextRequest) {
  try {
    const userId = 1 // TODO: Obtener del JWT/session real
    
    const [result] = await (await connection).execute(
      'DELETE FROM user_wishlist WHERE user_id = ?',
      [userId]
    )
    
    return NextResponse.json(
      { message: 'Lista de deseos vaciada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error clearing wishlist:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}