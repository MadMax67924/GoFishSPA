import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, quantity, estimatedDate } = await request.json()

    // Validar datos requeridos
    if (!productId || !productName) {
      return NextResponse.json(
        { error: 'ProductId y productName son requeridos' },
        { status: 400 }
      )
    }

    // Por ahora solo logueamos la preorden
    // Más adelante puedes crear una tabla 'preorders' en tu base de datos
    console.log('Nueva preorden recibida:', {
      productId,
      productName,
      quantity,
      estimatedDate,
      createdAt: new Date().toISOString()
    })

    // Simular guardado en base de datos
    // await executeQuery(
    //   'INSERT INTO preorders (product_id, product_name, quantity, estimated_date, created_at) VALUES (?, ?, ?, ?, ?)',
    //   [productId, productName, quantity, estimatedDate, new Date()]
    // )

    return NextResponse.json({ 
      success: true, 
      message: 'Preorden creada exitosamente',
      preorderId: `preorder_${Date.now()}`,
      estimatedDate: estimatedDate
    })

  } catch (error: any) {
    console.error('Error creating preorder:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    // Simular obtención de preordenes
    // const preorders = await executeQuery(
    //   'SELECT * FROM preorders WHERE product_id = ?',
    //   [productId]
    // )

    return NextResponse.json({ 
      preorders: [],
      count: 0
    })

  } catch (error: any) {
    console.error('Error fetching preorders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}