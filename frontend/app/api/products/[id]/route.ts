import { NextResponse } from "next/server"
import { getProductById } from "@/lib/server/products-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)

    console.log(`API Product [${productId}] - Buscando producto`)

    const product = getProductById(productId)

    if (!product) {
      console.log(`API Product [${productId}] - Producto no encontrado`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`API Product [${productId}] - Producto encontrado: ${product.name}`)
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)
    const { name, description, price, image, category, stock } = await request.json()

    const sql = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?
      WHERE id = ?
    `

    // Simular actualización con datos hardcodeados
    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)

    // Simular eliminación con datos hardcodeados
    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
fetch('/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 1,
    quantity: 1
  })
})