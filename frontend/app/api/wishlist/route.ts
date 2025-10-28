import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gofish'
})

// GET /api/wishlist - Obtener wishlist del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = 1 // TODO: Obtener del JWT/session real
    
    const [rows] = await (await connection).execute(
      `SELECT w.*, p.name, p.price, p.image 
       FROM user_wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = ?`,
      [userId]
    )
    
    return NextResponse.json({ wishlist: rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Agregar producto a wishlist
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()
    const userId = 1 // TODO: Obtener del JWT/session real
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID es requerido' },
        { status: 400 }
      )
    }
    
    // Verificar que el producto existe
    const [productCheck] = await (await connection).execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )
    
    if ((productCheck as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    // Insertar en wishlist (UNIQUE constraint previene duplicados)
    await (await connection).execute(
      'INSERT IGNORE INTO user_wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    )
    
    return NextResponse.json(
      { message: 'Producto agregado a lista de deseos' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}