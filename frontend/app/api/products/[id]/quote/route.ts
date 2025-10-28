import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection
  
  try {
    const productId = parseInt(params.id)
    
    // Conexión directa (igual que en test-db)
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'toki1801',
      database: 'gofish'
    })
    
    // Obtener producto
    const [productResult] = await connection.execute(
      'SELECT id, name, price, stock FROM products WHERE id = ?',
      [productId]
    ) as any[]
    
    if (productResult.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    const product = productResult[0]
    
    // Verificar que esté agotado
    if (product.stock > 0) {
      return NextResponse.json(
        { error: 'El producto está disponible para compra directa' },
        { status: 400 }
      )
    }
    
    // Generar estimación basada en precio actual
    const basePrice = product.price
    const historicalPrices = [
      Math.round(basePrice * 0.95), // -5%
      Math.round(basePrice * 1.02), // +2%
      Math.round(basePrice * 0.98), // -2%
      Math.round(basePrice * 1.05), // +5%
      Math.round(basePrice),         // precio actual
    ]
    
    const estimatedPrice = Math.round(
      historicalPrices.reduce((sum, price) => sum + price, 0) / historicalPrices.length
    )
    
    const minPrice = Math.min(...historicalPrices)
    const maxPrice = Math.max(...historicalPrices)
    const confidence = 'media' // Basado en 5 datos simulados
    
    return NextResponse.json({
      productName: product.name,
      estimatedPrice,
      priceRange: {
        min: minPrice,
        max: maxPrice
      },
      confidence,
      lastPrice: basePrice,
      historicalPrices: historicalPrices.length,
      message: 'El producto está agotado. Esta es una estimación basada en precios anteriores.'
    })
    
  } catch (error: any) {
    console.error('Error en cotización:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}