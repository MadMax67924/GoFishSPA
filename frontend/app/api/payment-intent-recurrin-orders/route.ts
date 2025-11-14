import { NextResponse } from "next/server"
import Stripe from "stripe"
import { executeQuery } from "@/lib/mysql"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

// Endpoint especializado para crear sesiones de checkout recurrentes en Stripe
export async function POST(request: Request) {
  try {
    const { orderData } = await request.json()

    if (!orderData?.total || !orderData?.id) {
      return NextResponse.json(
        { error: "Complete order data is required" },
        { status: 400 }
      )
    }

    // Validar que sea una orden recurrente
    if (!orderData.is_recurring || !orderData.recurring_config) {
      return NextResponse.json(
        { error: "This endpoint is only for recurring orders" },
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

    const recurringConfig = orderData.recurring_config
    const intervalMonths = recurringConfig.intervalMonths || 1
    const totalCycles = recurringConfig.totalCycles || 1

    console.log(`🔄 Creando suscripción recurrente: cada ${intervalMonths} mes(es), ${totalCycles} ciclos`)

    // Crear producto de suscripción en Stripe
    const product = await stripe.products.create({
      name: `Suscripción GoFish - Orden #${orderData.order_number || orderData.id}`,
      description: `Compra recurrente cada ${intervalMonths} mes(es) - ${totalCycles} ciclos totales`,
      metadata: {
        order_id: orderData.id.toString(),
        interval_months: intervalMonths.toString(),
        total_cycles: totalCycles.toString()
      }
    })

    console.log(`✅ Producto de suscripción creado: ${product.id}`)

    // Crear precio de suscripción
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(orderData.total),
      currency: 'clp',
      recurring: {
        interval: 'month',
        interval_count: intervalMonths
      },
      metadata: {
        order_id: orderData.id.toString(),
        order_number: orderData.order_number || '',
        interval_months: intervalMonths.toString()
      }
    })

    console.log(`✅ Precio de suscripción creado: ${price.id}`)

    // Crear sesión de checkout para suscripción
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          order_id: orderData.id.toString(),
          order_number: orderData.order_number || '',
          interval_months: intervalMonths.toString(),
          total_cycles: totalCycles.toString(),
          customer_name: customerData.name,
          customer_email: customerData.email
        }
      },
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/confirmacion?order=${orderData.id}&session_id={CHECKOUT_SESSION_ID}&recurring=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?canceled=true&recurring=true`,
      customer_email: customerData.email,
      client_reference_id: orderData.id.toString(),
      billing_address_collection: 'auto',
      metadata: {
        order_id: orderData.id.toString(),
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        order_number: orderData.order_number || '',
        is_recurring: 'true',
        interval_months: intervalMonths.toString(),
        total_cycles: totalCycles.toString()
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
    })

    console.log(`✅ Sesión de checkout recurrente creada: ${session.id}`)

    // Actualizar la orden en la base de datos
    try {
      const updateSql = `
        UPDATE orders 
        SET stripe_payment_intent_id = ?, payment_method = 'webpay'
        WHERE id = ?
      `
      await executeQuery(updateSql, [session.id, orderData.id])
      console.log(`✅ Checkout Session ${session.id} guardada para orden recurrente ${orderData.id}`)
    } catch (dbError) {
      console.error("❌ Error guardando session en BD:", dbError)
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      isRecurring: true,
      subscriptionId: session.subscription?.toString() || null,
      productId: product.id,
      priceId: price.id,
      intervalMonths: intervalMonths,
      totalCycles: totalCycles
    })

  } catch (error) {
    console.error("❌ Error creating recurring checkout session:", error)
    return NextResponse.json(
      { error: "Error creating recurring checkout session" },
      { status: 500 }
    )
  }
}

// Endpoint para obtener información de una suscripción recurrente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get("subscription_id")
    const orderId = searchParams.get("order_id")

    if (!subscriptionId && !orderId) {
      return NextResponse.json(
        { error: "Se requiere subscription_id o order_id" },
        { status: 400 }
      )
    }

    if (subscriptionId) {
      // Obtener información de la suscripción desde Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      return NextResponse.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          items: subscription.items.data.map(item => ({
            price_id: item.price.id,
            quantity: item.quantity
          }))
        }
      })
    }

    if (orderId) {
      // Buscar suscripción por order_id en metadata
      const subscriptions = await stripe.subscriptions.search({
        query: `metadata['order_id']:'${orderId}'`,
      })

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: "No se encontró suscripción para esta orden" },
          { status: 404 }
        )
      }

      const subscription = subscriptions.data[0]
      
      return NextResponse.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          metadata: subscription.metadata
        }
      })
    }

  } catch (error) {
    console.error("❌ Error obteniendo información de suscripción:", error)
    return NextResponse.json(
      { error: "Error obteniendo información de suscripción" },
      { status: 500 }
    )
  }
}

// Endpoint para cancelar una suscripción recurrente
export async function DELETE(request: Request) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Se requiere subscriptionId" },
        { status: 400 }
      )
    }

    // Cancelar suscripción en Stripe (al final del periodo actual)
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    console.log(`✅ Suscripción ${subscriptionId} programada para cancelación`)

    // Actualizar estado en la base de datos
    try {
      const updateSql = `
        UPDATE recurring_orders 
        SET status = 'cancelled', updated_at = NOW()
        WHERE stripe_subscription_id = ?
      `
      await executeQuery(updateSql, [subscriptionId])
    } catch (dbError) {
      console.error("❌ Error actualizando estado en BD:", dbError)
    }

    return NextResponse.json({
      success: true,
      message: "Suscripción programada para cancelación",
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        current_period_end: canceledSubscription.current_period_end
      }
    })

  } catch (error) {
    console.error("❌ Error cancelando suscripción:", error)
    return NextResponse.json(
      { error: "Error cancelando suscripción" },
      { status: 500 }
    )
  }
}