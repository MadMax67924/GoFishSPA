import { NextResponse } from "next/server"
import { getProductById } from "@/lib/server/products-data"

// Simulación de base de datos de productos
const ALL_PRODUCTS = [
  { id: 1, name: "Salmón Fresco", category: "pescados", price: 8990, image: "/images/salmon.jpg" },
  { id: 2, name: "Salmón Ahumado", category: "pescados", price: 10990, image: "/images/salmon-ahumado.jpg" },
  { id: 3, name: "Salmón Congelado", category: "pescados", price: 7990, image: "/images/salmon-congelado.jpg" },
  { id: 4, name: "Merluza Austral", category: "pescados", price: 5990, image: "/images/merluza.jpg" },
  { id: 5, name: "Reineta", category: "pescados", price: 6490, image: "/images/reineta.jpg" },
  { id: 6, name: "Camarones Grandes", category: "mariscos", price: 12990, image: "/images/camarones.jpg" },
  { id: 7, name: "Camarones Medianos", category: "mariscos", price: 8990, image: "/images/camarones-medianos.jpg" },
  { id: 8, name: "Congrio Dorado", category: "pescados", price: 9990, image: "/images/congrio.jpg" },
  { id: 9, name: "Choritos Frescos", category: "mariscos", price: 4990, image: "/images/choritos.jpg" },
  { id: 10, name: "Pulpo Fresco", category: "mariscos", price: 15990, image: "/images/pulpo.jpg" },
  { id: 11, name: "Atún Fresco", category: "pescados", price: 11990, image: "/images/atun.jpg" },
  { id: 12, name: "Almejas", category: "mariscos", price: 7990, image: "/images/almejas.jpg" },
  { id: 13, name: "Ostras Frescas", category: "mariscos", price: 12990, image: "/images/ostras.jpg" },
  { id: 14, name: "Machas", category: "mariscos", price: 8990, image: "/images/machas.jpg" },
  { id: 15, name: "Langostinos", category: "mariscos", price: 14990, image: "/images/langostinos.jpg" }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Filtrar productos que coincidan con la query
    const filteredProducts = ALL_PRODUCTS.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    ).slice(0, limit)

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error en búsqueda de productos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}