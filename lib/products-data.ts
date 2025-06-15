export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
  featured: boolean
  images: string[] // Para CU20: ver imágenes en alta calidad
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    name: "Salmón Fresco",
    price: 8990,
    image: "/placeholder.svg?height=400&width=400",
    category: "pescados",
    description:
      "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches. Pescado de primera calidad con certificación de origen.",
    stock: 50,
    featured: true,
    images: [
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
    ],
  },
  {
    id: 2,
    name: "Atún Rojo",
    price: 12990,
    image: "/placeholder.svg?height=400&width=400",
    category: "pescados",
    description:
      "Atún rojo de primera calidad, perfecto para sashimi y preparaciones gourmet. Capturado de forma sostenible.",
    stock: 25,
    featured: true,
    images: [
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
    ],
  },
  {
    id: 3,
    name: "Merluza Austral",
    price: 5990,
    image: "/placeholder.svg?height=400&width=400",
    category: "pescados",
    description: "Merluza austral de aguas profundas, perfecta para frituras y guisos. Carne blanca y suave.",
    stock: 40,
    featured: false,
    images: ["/placeholder.svg?height=800&width=800", "/placeholder.svg?height=800&width=800"],
  },
  {
    id: 4,
    name: "Camarones Ecuatorianos",
    price: 15990,
    image: "/placeholder.svg?height=400&width=400",
    category: "mariscos",
    description: "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas. Tamaño jumbo.",
    stock: 30,
    featured: true,
    images: [
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
    ],
  },
  {
    id: 5,
    name: "Pulpo Español",
    price: 18990,
    image: "/placeholder.svg?height=400&width=400",
    category: "mariscos",
    description: "Pulpo español cocido, listo para ensaladas y tapas. Textura perfecta y sabor auténtico.",
    stock: 15,
    featured: false,
    images: ["/placeholder.svg?height=800&width=800", "/placeholder.svg?height=800&width=800"],
  },
  {
    id: 6,
    name: "Congrio Dorado",
    price: 9990,
    image: "/placeholder.svg?height=400&width=400",
    category: "pescados",
    description: "Congrio dorado fresco, ideal para caldillo y frituras. Pescado tradicional chileno.",
    stock: 35,
    featured: false,
    images: ["/placeholder.svg?height=800&width=800", "/placeholder.svg?height=800&width=800"],
  },
  {
    id: 7,
    name: "Choritos",
    price: 4990,
    image: "/placeholder.svg?height=400&width=400",
    category: "mariscos",
    description: "Choritos frescos de la zona, perfectos para preparar a la marinera. Sabor intenso del mar.",
    stock: 60,
    featured: false,
    images: ["/placeholder.svg?height=800&width=800", "/placeholder.svg?height=800&width=800"],
  },
  {
    id: 8,
    name: "Reineta",
    price: 6490,
    image: "/placeholder.svg?height=400&width=400",
    category: "pescados",
    description: "Reineta fresca, pescado blanco de sabor suave ideal para hornear. Muy versátil en la cocina.",
    stock: 45,
    featured: true,
    images: ["/placeholder.svg?height=800&width=800", "/placeholder.svg?height=800&width=800"],
  },
  {
    id: 9,
    name: "Langostinos",
    price: 22990,
    image: "/placeholder.svg?height=400&width=400",
    category: "mariscos",
    description: "Langostinos frescos de gran tamaño, perfectos para ocasiones especiales. Sabor exquisito.",
    stock: 20,
    featured: true,
    images: [
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
      "/placeholder.svg?height=800&width=800",
    ],
  },
  {
    id: 10,
    name: "Corvina",
    price: 7990,
    image: "/placeholder.svg?height=400&width=400",
    category: "pescados",
    description: "Corvina fresca, pescado de carne firme ideal para ceviches y preparaciones al vapor.",
    stock: 30,
    featured: false,
    images: ["/placeholder.svg?height=800&width=800", "/placeholder.svg?height=800&width=800"],
  },
]

// Función para obtener todos los productos
export function getAllProducts(): Product[] {
  return PRODUCTS_DATA
}

// Función para filtrar y ordenar productos
export function filterAndSortProducts(
  products: Product[],
  query?: string,
  categories?: string[],
  minPrice?: number,
  maxPrice?: number,
  sortBy?: string,
  sortOrder?: string,
  limit?: number,
): Product[] {
  let filtered = [...products]

  // CU15: Buscar productos
  if (query) {
    const queryLower = query.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.category.toLowerCase().includes(queryLower),
    )
  }

  // CU17: Filtrar por categorías
  if (categories && categories.length > 0) {
    filtered = filtered.filter((p) => categories.includes(p.category))
  }

  // Filtrar por precio
  if (minPrice !== undefined && minPrice > 0) {
    filtered = filtered.filter((p) => p.price >= minPrice)
  }
  if (maxPrice !== undefined && maxPrice < 999999) {
    filtered = filtered.filter((p) => p.price <= maxPrice)
  }

  // CU23: Ordenar productos
  if (sortBy && sortOrder) {
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product]
      let bValue: any = b[sortBy as keyof Product]

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

  // Limitar resultados
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit)
  }

  return filtered
}

// Función para obtener un producto por ID
export function getProductById(id: number): Product | null {
  return PRODUCTS_DATA.find((p) => p.id === id) || null
}

// CU49: Obtener productos relacionados
export function getRelatedProducts(productId: number, category: string, limit = 4): Product[] {
  return PRODUCTS_DATA.filter((p) => p.id !== productId && p.category === category).slice(0, limit)
}

// Función para obtener productos destacados
export function getFeaturedProducts(limit = 4): Product[] {
  return PRODUCTS_DATA.filter((p) => p.featured).slice(0, limit)
}

// Función para obtener categorías únicas
export function getCategories(): string[] {
  return [...new Set(PRODUCTS_DATA.map((p) => p.category))]
}
