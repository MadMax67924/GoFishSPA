import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const sql = "SELECT * FROM products WHERE id = ?"
    const products = await executeQuery(sql, [productId])

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(products[0])
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const { name, description, price, image, category, stock } = await request.json()

    const sql = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?
      WHERE id = ?
    `

    await executeQuery(sql, [name, description, price, image, category, stock, productId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const sql = "DELETE FROM products WHERE id = ?"
    await executeQuery(sql, [productId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
