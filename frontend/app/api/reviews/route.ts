import { NextResponse } from "next/server"

// Datos de ejemplo para reviews (reemplaza con tu base de datos real)
const sampleReviews = [
  { id: 1, productId: 1, userId: 1, rating: 5, comment: "Excelente producto", date: "2024-01-15" },
  { id: 2, productId: 1, userId: 2, rating: 4, comment: "Muy bueno", date: "2024-01-16" },
  { id: 3, productId: 2, userId: 3, rating: 3, comment: "Regular", date: "2024-01-17" },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    console.log(`API Reviews - Buscando reviews para producto: ${productId}`)

    if (!productId) {
      return NextResponse.json({ error: "productId es requerido" }, { status: 400 })
    }

    const productIdNum = Number.parseInt(productId)
    const reviews = sampleReviews.filter(review => review.productId === productIdNum)

    console.log(`API Reviews - Encontradas ${reviews.length} reviews para producto ${productId}`)
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error al obtener reviews:", error)
    return NextResponse.json({ error: "Error al obtener reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, userId, rating, comment } = await request.json()

    if (!productId || !userId || !rating) {
      return NextResponse.json({ error: "productId, userId y rating son requeridos" }, { status: 400 })
    }

    // Simular creación de review
    const newReview = {
      id: Math.max(...sampleReviews.map(r => r.id)) + 1,
      productId: Number.parseInt(productId),
      userId,
      rating,
      comment: comment || "",
      date: new Date().toISOString().split('T')[0]
    }

    console.log(`API Reviews - Review creada: ${newReview.id}`)
    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error("Error al crear review:", error)
    return NextResponse.json({ error: "Error al crear review" }, { status: 500 })
  }
}