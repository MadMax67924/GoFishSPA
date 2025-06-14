import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

// Datos de ejemplo como fallback
const EXAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Salmón Fresco",
    description: "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
    price: 8990,
    image: "/placeholder.svg?height=200&width=300",
    category: "pescados",
    stock: 50,
    featured: true,
  },
  {
    id: 2,
    name: "Merluza Austral",
    description: "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
    price: 5990,
    image: "/placeholder.svg?height=200&width=300",
    category: "pescados",
    stock: 40,
    featured: true,
  },
  {
    id: 3,
    name: "Reineta",
    description: "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
    price: 6490,
    image: "/placeholder.svg?height=200&width=300",
    category: "pescados",
    stock: 35,
    featured: true,
  },
  {
    id: 4,
    name: "Camarones",
    description: "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
    price: 12990,
    image: "/placeholder.svg?height=200&width=300",
    category: "mariscos",
    stock: 30,
    featured: true,
  },
  {
    id: 5,
    name: "Congrio",
    description: "Congrio dorado, ideal para caldillo y frituras.",
    price: 9990,
    image: "/placeholder.svg?height=200&width=300",
    category: "pescados",
    stock: 25,
    featured: false,
  },
  {
    id: 6,
    name: "Choritos",
    description: "Choritos frescos de la zona, perfectos para preparar a la marinera.",
    price: 4990,
    image: "/placeholder.svg?height=200&width=300",
    category: "mariscos",
    stock: 60,
    featured: false,
  },
  {
    id: 7,
    name: "Pulpo",
    description: "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.",
    price: 15990,
    image: "/placeholder.svg?height=200&width=300",
    category: "mariscos",
    stock: 15,
    featured: false,
  },
  {
    id: 8,
    name: "Atún",
    description: "Atún fresco, perfecto para tataki y preparaciones a la plancha.",
    price: 11990,
    image: "/placeholder.svg?height=200&width=300",
    category: "pescados",
    stock: 20,
    featured: false,
  },
]

function filterAndSortProducts(products: any[], searchParams: URLSearchParams) {
  const query = searchParams.get("q") || ""
  const categories = searchParams.getAll("category")
  const minPrice = Number(searchParams.get("minPrice") || 0)
  const maxPrice = Number(searchParams.get("maxPrice") || 1000000)
  const sortBy = searchParams.get("sortBy") || "name"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  let filtered = [...products]

  // Filtro por búsqueda
  if (query) {
    const queryLower = query.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        (p.description && p.description.toLowerCase().includes(queryLower)) ||
        p.category.toLowerCase().includes(queryLower),
    )
  }

  // Filtro por categorías
  if (categories.length > 0) {
    filtered = filtered.filter((p) => categories.includes(p.category))
  }

  // Filtro por precio
  filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice)

  // Ordenamiento
  const validSortFields = ["name", "price", "category", "stock"]
  const validSortOrders = ["asc", "desc"]

  if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
  }

  return filtered
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Intentar obtener datos de la base de datos
    try {
      let sql = "SELECT * FROM products WHERE 1=1"
      const params: any[] = []

      const query = searchParams.get("q")
      const categories = searchParams.getAll("category")
      const minPrice = Number(searchParams.get("minPrice") || 0)
      const maxPrice = Number(searchParams.get("maxPrice") || 1000000)

      // Filtros SQL
      if (query) {
        sql += " AND (name LIKE ? OR description LIKE ?)"
        params.push(`%${query}%`, `%${query}%`)
      }

      if (categories.length > 0) {
        const categoryPlaceholders = categories.map(() => "?").join(",")
        sql += ` AND category IN (${categoryPlaceholders})`
        params.push(...categories)
      }

      sql += " AND price >= ? AND price <= ?"
      params.push(minPrice, maxPrice)

      // Ordenamiento
      const sortBy = searchParams.get("sortBy") || "name"
      const sortOrder = searchParams.get("sortOrder") || "asc"
      const validSortFields = ["name", "price", "category", "stock", "created_at"]

      if (validSortFields.includes(sortBy)) {
        sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`
      } else {
        sql += " ORDER BY name ASC"
      }

      const products = await executeQuery(sql, params)

      if (Array.isArray(products)) {
        return NextResponse.json(products)
      } else {
        throw new Error("Invalid database response")
      }
    } catch (dbError) {
      console.log("Base de datos no disponible, usando datos de ejemplo:", dbError)

      // Usar datos de ejemplo y aplicar filtros
      const filteredProducts = filterAndSortProducts(EXAMPLE_PRODUCTS, searchParams)
      return NextResponse.json(filteredProducts)
    }
  } catch (error) {
    console.error("Error al obtener productos:", error)

    // En caso de error total, devolver datos de ejemplo básicos
    const filteredProducts = filterAndSortProducts(EXAMPLE_PRODUCTS, new URLSearchParams())
    return NextResponse.json(filteredProducts)
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
