import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gofish'
})

// DELETE /api/wishlist/[id] - Eliminar producto de wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const userId = 1 // TODO: Obtener del JWT/session real
    
    const [result] = await (await connection).execute(
      'DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    
    const affectedRows = (result as any).affectedRows
    
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado en lista de deseos' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Producto eliminado de lista de deseos' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}