import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

let reviews: any[] = []

//Extrae los datos de la base de datos y los retorna como tipo JSON
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { error: "productId es requerido" },
        { status: 400 }
      )
    }

    //Consulta a la base de datos mediante query para exrtraer los datos necesarios en el formato necesario
    //Se extraen solo cuando sean iguales al product id del producto actual y si han sido aprovados
    const reviews = await executeQuery(
      `SELECT id, productId, texto, imagen, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha, aprovado 
       FROM reviews 
       WHERE productId = ? AND aprovado = true
       ORDER BY fecha DESC`,
      [productId]
    )

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

//Ingresa los datos de la nueva resena a la base de datos
export async function POST(req: NextRequest) {
  const { productId, texto, imagen } = await req.json()
  const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const orderSql = `
        INSERT INTO reviews (
          id,
          productId,
          texto,
          imagen
        ) VALUES (?, ?, ?, ?)
      `
  
  await executeQuery(orderSql, [
    id,
    productId,
    texto,
    imagen,
      ])
  return NextResponse.json({
    id,
    productId,
    texto,
    imagen
  })
}