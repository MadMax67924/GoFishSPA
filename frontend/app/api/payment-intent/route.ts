import { NextResponse } from "next/server"
import Stripe from "stripe"
import { executeQuery } from "@/lib/mysql"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})


//Saca los datos necesarios de la base de datos y con esos genera una checkout session de Stripe
export async function POST(request: Request) {
  try {
    const { orderData } = await request.json()

    if (!orderData?.total || !orderData?.id) {
      return NextResponse.json(
        { error: "Complete order data is required" },
        { status: 400 }
      )
    }

    const customerData = {
      name: `${orderData.first_name} ${orderData.last_name}`,
      email: orderData.email,
      phone: orderData.phone,
      address: {
        line1: orderData.address,
        city: orderData.city,
        state: orderData.region,
        postal_code: orderData.postal_code,
        country: 'CL'
      }
    }

    let description = `Pedido ${orderData.order_number || orderData.id} - ${customerData.name}`
    if (orderData.items && orderData.items.length > 0) {
      const itemsDescription = orderData.items
        .slice(0, 3) 
        .map((item: any) => `${item.quantity}x ${item.name}`)
        .join(', ')
      description = `${itemsDescription} - ${customerData.name}`
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'clp',
            product_data: {
              name: `Pedido GoFish #${orderData.order_number || orderData.id}`,
              description: description,
            },
            unit_amount: Math.round(orderData.total),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/confirmacion?order=${orderData.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?canceled=true`,
      customer_email: customerData.email,
      client_reference_id: orderData.id.toString(),
      billing_address_collection: 'auto',
      metadata: {
        order_id: orderData.id.toString(),
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        order_number: orderData.order_number || '',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    })

    try {
      const updateSql = `
        UPDATE orders 
        SET stripe_payment_intent_id = ?, payment_method = 'webpay'
        WHERE id = ?
      `
      await executeQuery(updateSql, [session.id, orderData.id])
      console.log(`✅ Checkout Session ${session.id} guardada para orden ${orderData.id}`)
    } catch (dbError) {
      console.error("Error guardando session en BD:", dbError)
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    )
  }
}