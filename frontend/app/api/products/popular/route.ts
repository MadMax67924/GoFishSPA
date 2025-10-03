import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET() {
  try {
    // Usar los nombres correctos de tus columnas
    const sql = `
      SELECT 
        id,
        name,
        description,
        price,
        image as image_url,
        category,
        featured,
        stock
      FROM products 
      WHERE featured = 1
      ORDER BY RAND()
      LIMIT 8
    `
    
    const result = await executeQuery(sql)
    
    // Verificar y convertir el resultado
    let products: any[] = []
    
    if (Array.isArray(result)) {
      products = result
    } else {
      // Si no es array, puede ser OkPacket u otro tipo
      console.log('Tipo de resultado:', typeof result)
      products = []
    }
    
    // Agregar ventas simuladas para el diseño
    const productsWithSales = products.map((product: any) => ({
      ...product,
      total_sold: Math.floor(Math.random() * 100) + 10
    }))
    
    return NextResponse.json({
      success: true,
      products: productsWithSales
    })
    
  } catch (error) {
    console.error("Error obteniendo productos populares:", error)
    return NextResponse.json(
      { error: "Error al obtener productos populares" },
      { status: 500 }
    )
  }
}