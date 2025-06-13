import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const categories = searchParams.getAll("category")
    const minPrice = Number(searchParams.get("minPrice") || 0)
    const maxPrice = Number(searchParams.get("maxPrice") || 1000000)
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Construir la consulta SQL
    let sql = "SELECT * FROM products WHERE price >= ? AND price <= ?"
    const params: any[] = [minPrice, maxPrice]

    // Filtro por búsqueda
    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ?)"
      params.push(`%${query}%`, `%${query}%`)
    }

    // Filtro por categorías
    if (categories.length > 0) {
      const categoryPlaceholders = categories.map(() => "?").join(",")
      sql += ` AND category IN (${categoryPlaceholders})`
      params.push(...categories)
    }

    // Ordenamiento
    const validSortFields = ["name", "price", "category", "stock", "created_at"]
    const validSortOrders = ["asc", "desc"]

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      sql += " ORDER BY name ASC"
    }

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
