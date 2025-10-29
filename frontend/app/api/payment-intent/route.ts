import { NextResponse } from "next/server"
import Stripe from "stripe"
import { executeQuery } from "@/lib/mysql"

// DEBUG: Verificar que la variable de entorno se carga
console.log("🔍 STRIPE_SECRET_KEY disponible:", !!process.env.STRIPE_SECRET_KEY)
console.log("🔍 NODE_ENV:", process.env.NODE_ENV)
console.log("🔍 APP_URL:", process.env.APP_URL)

// Inicializar Stripe con manejo robusto de errores
let stripe: Stripe | null = null

try {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  
  if (!stripeKey) {
    console.error("❌ STRIPE_SECRET_KEY no está definida")
    console.error("❌ Variables de entorno disponibles:", Object.keys(process.env).filter(key => key.includes('STRIPE')))
  } else if (!stripeKey.startsWith('sk_')) {
    console.error("❌ STRIPE_SECRET_KEY tiene formato incorrecto. Debe empezar con 'sk_'")
  } else {
    stripe = new Stripe(stripeKey, {
      apiVersion: "2024-09-30.acacia",
    })
    console.log("✅ Stripe inicializado correctamente")
  }
} catch (error) {
  console.error("❌ Error inicializando Stripe:", error)
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Iniciando creación de sesión de pago...")
    
    // Verificar que Stripe esté inicializado
    if (!stripe) {
      console.error("❌ Stripe no está inicializado - Verificar variables de entorno")
      return NextResponse.json(
        { 
          error: "Error de configuración de pago",
          details: "Stripe no está configurado correctamente. Contacta al administrador."
        },
        { status: 500 }
      )
    }

    const { orderData } = await request.json()
    console.log("💳 Datos de orden recibidos para Stripe:", {
      orderId: orderData.id,
      orderNumber: orderData.order_number,
      total: orderData.total,
      customer: `${orderData.first_name} ${orderData.last_name}`
    })

    // Validaciones
    if (!orderData?.total || !orderData?.id) {
      return NextResponse.json(
        { error: "Datos de orden incompletos" },
        { status: 400 }
      )
    }

    // Preparar datos del cliente
    const customerName = `${orderData.first_name} ${orderData.last_name}`
    const customerEmail = orderData.email

    // Validar monto
    const totalAmount = Number(orderData.total)
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Monto total inválido" },
        { status: 400 }
      )
    }

    // Para CLP, Stripe espera el amount en pesos (sin decimales)
    const unitAmount = Math.round(totalAmount)
    console.log("💰 Procesando pago de:", unitAmount, "CLP")

    // Crear descripción
    let description = `Pedido #${orderData.order_number} - ${customerName}`
    if (orderData.items && orderData.items.length > 0) {
      const itemsDescription = orderData.items
        .slice(0, 3)
        .map((item: any) => `${item.quantity}x ${item.name}`)
        .join(', ')
      description = `${itemsDescription} - ${customerName}`
    }

    console.log("🛒 Creando sesión de checkout en Stripe...")

    // Configurar URLs
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const successUrl = `${appUrl}/checkout/confirmacion?order=${orderData.order_number}&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${appUrl}/checkout?canceled=true`

    console.log("🔗 URLs configuradas:", { successUrl, cancelUrl })

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'clp',
            product_data: {
              name: `Pedido GoFish #${orderData.order_number}`,
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
      customer_email: customerEmail,
      client_reference_id: orderData.id.toString(),
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CL'],
      },
      metadata: {
        order_id: orderData.id.toString(),
        customer_name: customerName,
        customer_phone: orderData.phone,
        order_number: orderData.order_number,
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

    console.log("✅ Sesión de Stripe creada exitosamente:", session.id)
    console.log("🔗 URL de Checkout disponible")

    // Guardar session_id en la base de datos
    try {
      const updateSql = `
        UPDATE orders 
        SET stripe_payment_intent_id = ?, payment_method = 'webpay', status = 'pending'
        WHERE id = ?
      `
      await executeQuery(updateSql, [session.id, orderData.id])
      console.log(`✅ Session ID guardada en BD para orden ${orderData.id}`)
    } catch (dbError) {
      console.error("⚠️ Error guardando session en BD (no crítico):", dbError)
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      orderNumber: orderData.order_number
    })

  } catch (error: any) {
    console.error("❌ Error creando sesión de checkout:", error)
    
    // Log detallado para debugging
    console.error("🔍 Detalles del error Stripe:", {
      type: error.type,
      code: error.code,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Oculto en producción'
    })
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: "Error de tarjeta: " + error.message },
        { status: 400 }
      )
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: "Error en la solicitud a Stripe: " + error.message },
        { status: 400 }
      )
    } else if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: "Error de conexión con Stripe. Intenta nuevamente." },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { 
          error: "Error procesando el pago",
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }
  }
}

// GET para verificar estado del endpoint
export async function GET() {
  const isConfigured = !!process.env.STRIPE_SECRET_KEY && 
                      process.env.STRIPE_SECRET_KEY.startsWith('sk_')
  
  return NextResponse.json({
    name: "Stripe Payment API",
    status: isConfigured ? "configurado" : "no configurado",
    stripeInitialized: !!stripe,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/payment-intent': 'Crear sesión de pago Stripe'
    }
  })
}