import { NextResponse } from "next/server"
import { PRODUCTS_DATA, filterAndSortProducts } from "@/lib/products-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || undefined
    const categories = searchParams.get("categories")?.split(",") || undefined
    const minPrice = searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseInt(searchParams.get("maxPrice")!) : undefined
    const sortBy = searchParams.get("sortBy") || undefined
    const sortOrder = searchParams.get("sortOrder") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const products = filterAndSortProducts(
      PRODUCTS_DATA,
      query,
      categories,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit,
    )

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
