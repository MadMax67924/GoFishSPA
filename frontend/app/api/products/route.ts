import { NextResponse } from "next/server"
import { PRODUCTS_DATA, filterAndSortProducts } from "@/lib/server/products-data"
import { executeQuery } from "@/lib/mysql"

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
// Agrega esta función para obtener productos más vendidos
async function getTopSellingProducts(limit = 8) {
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.category,
      COUNT(oi.id) as sales_count,
      SUM(oi.quantity) as total_quantity_sold
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
    GROUP BY p.id, p.name, p.description, p.price, p.image_url, p.category
    HAVING total_quantity_sold > 0
    ORDER BY total_quantity_sold DESC
    LIMIT ?
  `
  
  return await executeQuery(sql, [limit])
}