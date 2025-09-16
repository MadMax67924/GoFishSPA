import { NextRequest, NextResponse } from "next/server"

let reviews: any[] = []

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")
  const filtered = reviews.filter((r) => r.productId === productId)
  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const { productId, texto, imagen } = await req.json()
  const review = {
    id: Date.now().toString(),
    productId,
    texto,
    imagen,
    fecha: new Date().toLocaleString(),
  }
  reviews.push(review)
  return NextResponse.json(review)
}