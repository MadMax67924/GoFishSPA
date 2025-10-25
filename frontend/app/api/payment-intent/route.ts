import { NextResponse } from "next/server"
import Stripe from "stripe"
import { executeQuery } from "@/lib/mysql"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})


//Saca los datos necesarios de la base de datos y con esos genera una checkout session de Stripe
export async function POST(request: Request) {
  try {
    const { amount, cartItems, orderId } = await request.json()

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "Amount and orderId are required" },
        { status: 400 }
      )
    }

    let customerData = null;
    let orderItems = [];
    
    try {
      const orderSql = `
        SELECT 
          o.first_name, o.last_name, o.email, o.phone, 
          o.address, o.city, o.region, o.postal_code,
          oi.product_name, oi.product_price, oi.quantity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
      `
      const orderResult = await executeQuery(orderSql, [orderId]) as any[]
      
      if (orderResult && orderResult.length > 0) {
        const order = orderResult[0]
        customerData = {
          name: `${order.first_name} ${order.last_name}`,
          email: order.email,
          phone: order.phone,
          address: {
            line1: order.address,
            city: order.city,
            state: order.region,
            postal_code: order.postal_code,
            country: 'CL'
          }
        }

        orderItems = orderResult
          .filter(row => row.product_name)
          .map(row => ({
            name: row.product_name,
            price: row.product_price,
            quantity: row.quantity
          }))
      }
    } catch (dbError) {
      console.error("Error obteniendo datos del pedido:", dbError)
      return NextResponse.json(
        { error: "Error al obtener los datos del pedido" },
        { status: 500 }
      )
    }

    if (!customerData) {
      return NextResponse.json(
        { error: "No se encontraron datos del pedido" },
        { status: 404 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'clp',
            product_data: {
              name: `Pedido GoFish #${orderId}`,
              description: `${orderItems.length} producto(s) - ${customerData.name}`,
            },
            unit_amount: Math.round(amount),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/confirmacion?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?canceled=true`,
      
      customer_email: customerData.email,
      client_reference_id: orderId,
      
      billing_address_collection: 'auto',
      
      custom_text: {
        submit: {
          message: 'Al pagar, aceptas nuestros términos y condiciones',
        }
      },
      metadata: {
        order_id: orderId,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        shipping_address: JSON.stringify(customerData.address),
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), 
    })

    try {
      const updateSql = `
        UPDATE orders 
        SET stripe_payment_intent_id = ?, payment_method = 'webpay', status = 'pending'
        WHERE id = ?
      `
      await executeQuery(updateSql, [session.id, orderId])
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