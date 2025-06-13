import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const minPrice = Number(searchParams.get("minPrice") || 0)
    const maxPrice = Number(searchParams.get("maxPrice") || 1000000)

    // Construir la consulta SQL
    let sql = "SELECT * FROM products WHERE price >= ? AND price <= ?"
    const params: any[] = [minPrice, maxPrice]

    if (query) {
      sql += " AND name LIKE ?"
      params.push(`%${query}%`)
    }

    if (category) {
      sql += " AND category = ?"
      params.push(category)
    }

    sql += " ORDER BY name ASC"

    const products = await executeQuery(sql, params)

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, image, category, stock } = await request.json()

    // Validar datos requeridos
    if (!name || !price || !category) {
      return NextResponse.json({ error: "Nombre, precio y categoría son requeridos" }, { status: 400 })
    }

    const sql = `
      INSERT INTO products (name, description, price, image, category, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(sql, [name, description, price, image, category, stock || 0])

    return NextResponse.json({
      success: true,
      productId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
