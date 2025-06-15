import { NextResponse } from "next/server"
import { PRODUCTS_DATA, filterAndSortProducts } from "@/lib/products-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const categories = searchParams.getAll("category")
    const minPrice = Number(searchParams.get("minPrice") || 0)
    const maxPrice = Number(searchParams.get("maxPrice") || 999999)
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined

    console.log("API Products - Parámetros:", {
      query,
      categories,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit,
    })

    const filteredProducts = filterAndSortProducts(
      PRODUCTS_DATA,
      query,
      categories.length > 0 ? categories : undefined,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit,
    )

    console.log(`API Products - Devolviendo ${filteredProducts.length} productos`)

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error("Error en API de productos:", error)
    return NextResponse.json(PRODUCTS_DATA)
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, image, category, stock, featured } = await request.json()

    // Simular creación de producto
    const newProduct = {
      id: Math.max(...PRODUCTS_DATA.map((p) => p.id)) + 1,
      name,
      description,
      price,
      image,
      category,
      stock,
      featured: featured || false,
      images: [image],
    }

    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
