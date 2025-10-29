import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-09-30.acacia",
    })

    // Intentar listar productos de prueba
    const products = await stripe.products.list({ limit: 1 })
    
    return NextResponse.json({
      status: "success",
      stripeConfigured: true,
      canConnect: true,
      productsCount: products.data.length
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      error: error.message,
      type: error.type
    }, { status: 500 })
  }
}