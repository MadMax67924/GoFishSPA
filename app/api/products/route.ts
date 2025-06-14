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

    try {
      // Intentar conectar a la base de datos
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
    } catch (dbError) {
      console.log("Base de datos no disponible, usando datos de ejemplo")

      // Datos de ejemplo cuando la BD no está disponible
      const exampleProducts = [
        {
          id: 1,
          name: "Salmón Fresco",
          description: "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
          price: 8990,
          image: "/images/salmon.jpg",
          category: "pescados",
          stock: 50,
          featured: true,
        },
        {
          id: 2,
          name: "Merluza Austral",
          description: "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
          price: 5990,
          image: "/images/merluza.jpg",
          category: "pescados",
          stock: 40,
          featured: true,
        },
        {
          id: 3,
          name: "Reineta",
          description: "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
          price: 6490,
          image: "/images/reineta.jpg",
          category: "pescados",
          stock: 35,
          featured: true,
        },
        {
          id: 4,
          name: "Camarones",
          description: "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
          price: 12990,
          image: "/images/camarones.jpg",
          category: "mariscos",
          stock: 30,
          featured: true,
        },
        {
          id: 5,
          name: "Congrio",
          description: "Congrio dorado, ideal para caldillo y frituras.",
          price: 9990,
          image: "/images/congrio.jpg",
          category: "pescados",
          stock: 25,
          featured: false,
        },
        {
          id: 6,
          name: "Choritos",
          description: "Choritos frescos de la zona, perfectos para preparar a la marinera.",
          price: 4990,
          image: "/images/choritos.jpg",
          category: "mariscos",
          stock: 60,
          featured: false,
        },
        {
          id: 7,
          name: "Pulpo",
          description: "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.",
          price: 15990,
          image: "/images/pulpo.jpg",
          category: "mariscos",
          stock: 15,
          featured: false,
        },
        {
          id: 8,
          name: "Atún",
          description: "Atún fresco, perfecto para tataki y preparaciones a la plancha.",
          price: 11990,
          image: "/images/atun.jpg",
          category: "pescados",
          stock: 20,
          featured: false,
        },
      ]

      // Aplicar filtros a los datos de ejemplo
      let filtered = exampleProducts

      // Filtro por búsqueda
      if (query) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()),
        )
      }

      // Filtro por categorías
      if (categories.length > 0) {
        filtered = filtered.filter((p) => categories.includes(p.category))
      }

      // Filtro por precio
      filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice)

      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a]
        let bValue: any = b[sortBy as keyof typeof b]

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

      return NextResponse.json(filtered)
    }
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
