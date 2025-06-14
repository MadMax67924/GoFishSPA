import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const categories = searchParams.getAll("category")
    const minPrice = Number(searchParams.get("minPrice") || 0)
    const maxPrice = Number(searchParams.get("maxPrice") || 999999)
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : null

    // Construir la consulta SQL base
    let sql = "SELECT * FROM products WHERE 1=1"
    const params: any[] = []

    // Filtro por búsqueda de texto
    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)"
      const searchTerm = `%${query}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // Filtro por categorías
    if (categories.length > 0) {
      const categoryPlaceholders = categories.map(() => "?").join(",")
      sql += ` AND category IN (${categoryPlaceholders})`
      params.push(...categories)
    }

    // Filtro por rango de precios
    if (minPrice > 0) {
      sql += " AND price >= ?"
      params.push(minPrice)
    }
    if (maxPrice < 999999) {
      sql += " AND price <= ?"
      params.push(maxPrice)
    }

    // Ordenamiento
    const validSortFields = ["name", "price", "category", "stock"]
    const validSortOrders = ["asc", "desc"]

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
    }

    // Límite de resultados
    if (limit && limit > 0) {
      sql += " LIMIT ?"
      params.push(limit)
    }

    console.log("SQL Query:", sql)
    console.log("Parameters:", params)

    const products = await executeQuery(sql, params)

    if (!Array.isArray(products)) {
      console.error("Query result is not an array:", products)
      return NextResponse.json([])
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error al obtener productos:", error)

    // Datos de fallback para desarrollo
    const fallbackProducts = [
      {
        id: 1,
        name: "Salmón Fresco",
        price: 8990,
        image: "/placeholder.svg?height=200&width=300",
        category: "pescados",
        description: "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
        stock: 50,
        featured: true,
      },
      {
        id: 2,
        name: "Atún Rojo",
        price: 12990,
        image: "/placeholder.svg?height=200&width=300",
        category: "pescados",
        description: "Atún rojo de primera calidad, perfecto para sashimi y preparaciones gourmet.",
        stock: 25,
        featured: true,
      },
      {
        id: 3,
        name: "Merluza Austral",
        price: 5990,
        image: "/placeholder.svg?height=200&width=300",
        category: "pescados",
        description: "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
        stock: 40,
        featured: false,
      },
      {
        id: 4,
        name: "Camarones Ecuatorianos",
        price: 15990,
        image: "/placeholder.svg?height=200&width=300",
        category: "mariscos",
        description: "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
        stock: 30,
        featured: true,
      },
      {
        id: 5,
        name: "Pulpo Español",
        price: 18990,
        image: "/placeholder.svg?height=200&width=300",
        category: "mariscos",
        description: "Pulpo español cocido, listo para ensaladas y tapas.",
        stock: 15,
        featured: false,
      },
    ]

    return NextResponse.json(fallbackProducts)
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, image, category, stock, featured } = await request.json()

    const sql = `
      INSERT INTO products (name, description, price, image, category, stock, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(sql, [name, description, price, image, category, stock, featured || false])

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
