import { NextResponse } from "next/server"
import Stripe from "stripe"
import { executeQuery } from "@/lib/mysql"

// DEBUG: Verificar que la variable de entorno se carga
console.log("🔍 STRIPE_SECRET_KEY disponible:", !!process.env.STRIPE_SECRET_KEY)

// CORRECCIÓN: Usar la versión correcta de la API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia", // VERSIÓN CORREGIDA
})

// Crear sesión de checkout de Stripe
export async function POST(request: Request) {
  try {
    const { orderData } = await request.json()

    console.log("💳 Creando sesión de pago Stripe para orden:", orderData.order_number || orderData.id)

    // Validaciones
    if (!orderData?.total || !orderData?.id) {
      return NextResponse.json(
        { error: "Datos de orden completos son requeridos" },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe no está configurado" },
        { status: 500 }
      )
    }

    // Preparar datos del cliente
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

    // Validar que el total sea un número válido
    const totalAmount = Number(orderData.total)
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Monto total inválido" },
        { status: 400 }
      )
    }

    // Para CLP, Stripe espera el amount en pesos (sin decimales)
    const unitAmount = Math.round(totalAmount)

    console.log("💰 Monto para Stripe:", unitAmount, "CLP")

    // Crear descripción del pedido
    let description = `Pedido ${orderData.order_number || orderData.id} - ${customerData.name}`
    if (orderData.items && orderData.items.length > 0) {
      const itemsDescription = orderData.items
        .slice(0, 3)
        .map((item: any) => `${item.quantity}x ${item.name}`)
        .join(', ')
      description = `${itemsDescription} - ${customerData.name}`
    }

    console.log("🛒 Creando sesión de Stripe...")

    // Configurar URLs
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const successUrl = `${appUrl}/checkout/confirmacion?order=${orderData.order_number || orderData.id}&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${appUrl}/checkout?canceled=true`

    console.log("🔗 URLs configuradas:", { successUrl, cancelUrl })

    // Crear sesión de checkout en Stripe
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
              metadata: {
                order_id: orderData.id.toString()
              }
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerData.email,
      client_reference_id: orderData.id.toString(),
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CL'],
      },
      metadata: {
        order_id: orderData.id.toString(),
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        order_number: orderData.order_number || orderData.id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
      custom_text: {
        shipping_address: {
          message: "Para envíos dentro de Chile. Envío gratis en pedidos sobre $30,000 en Valparaíso.",
        },
        submit: {
          message: "Al confirmar el pago, aceptas nuestros términos y condiciones.",
        },
      },
    })

    console.log("✅ Sesión de Stripe creada:", session.id)
    console.log("🔗 URL de Checkout:", session.url)

    // Guardar el session_id en la base de datos
    try {
      const updateSql = `
        UPDATE orders 
        SET stripe_payment_intent_id = ?, payment_method = 'webpay', status = 'pending'
        WHERE id = ?
      `
      await executeQuery(updateSql, [session.id, orderData.id])
      console.log(`✅ Session ID ${session.id} guardada para orden ${orderData.id}`)
    } catch (dbError) {
      console.error("❌ Error guardando session en BD:", dbError)
      // No fallar si hay error en BD, el pago puede continuar
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })

  } catch (error: any) {
    console.error("❌ Error creando sesión de checkout:", error)
    
    // Log detallado del error
    console.error("🔍 Detalles del error:", {
      type: error.type,
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: "Error de tarjeta: " + error.message },
        { status: 400 }
      )
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: "Solicitud inválida a Stripe: " + error.message },
        { status: 400 }
      )
    } else if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: "Error de conexión con Stripe. Por favor, intenta nuevamente." },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { 
          error: "Error creando sesión de pago",
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      )
    }
  }
}

// GET method para información del endpoint
export async function GET() {
  const isConfigured = !!process.env.STRIPE_SECRET_KEY && 
                      process.env.STRIPE_SECRET_KEY.startsWith('sk_')
  
  return NextResponse.json({
    name: "Stripe Payment Intent API",
    description: "Endpoint para procesar pagos con Stripe",
    status: isConfigured ? "configurado" : "no configurado",
    environment: process.env.NODE_ENV,
    endpoints: {
      'POST /api/payment-intent': 'Crear sesión de pago Stripe'
    }
  })
}