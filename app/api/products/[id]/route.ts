import { type NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/lib/products-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API: Fetching product with ID: ${id}`)

    // Validate ID
    const productId = Number.parseInt(id)
    if (isNaN(productId) || productId < 1) {
      console.log(`API: Invalid product ID: ${id}`)
      return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 })
    }

    // Get product from hardcoded data
    const product = getProductById(productId)

    if (!product) {
      console.log(`API: Product not found: ${id}`)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log(`API: Product found: ${product.name}`)
    return NextResponse.json(product)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
