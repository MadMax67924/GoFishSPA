import { NextResponse } from "next/server";
import { createPaymentPreference, getPayment } from "@/lib/payment-provider";
import { executeQuery } from "@/lib/mysql";
import { cookies } from "next/headers";

// Crear preferencia de pago en Mercado Pago
export async function POST(request: Request) {
  try {
    const { orderId, items, payer } = await request.json();

    console.log("🔍 Datos recibidos para checkout:", { orderId, items: items?.length, payer });

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: "Datos de pago incompletos" }, { status: 400 });
    }

    // Verificar si Mercado Pago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.log("⚠️ Mercado Pago no configurado, usando modo simulación");
      
      // Modo simulación para desarrollo
      return NextResponse.json({
        preferenceId: "simulated-" + Date.now(),
        initPoint: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/simulated-payment?orderId=${orderId}`,
        sandboxInitPoint: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/simulated-payment?orderId=${orderId}`,
        simulated: true
      });
    }

    // Crear preferencia en Mercado Pago (solo si está configurado)
    const preference = await createPaymentPreference({
      items: items.map((item: any) => ({
        title: item.name,
        quantity: item.quantity,
        currency_id: "CLP",
        unit_price: item.price,
      })),
      payer: payer ? {
        email: payer.email,
        name: payer.firstName,
        surname: payer.lastName,
      } : undefined,
      back_urls: {
        success: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/confirmation`,
        failure: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/error`,
        pending: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: orderId.toString(),
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("❌ Error creating checkout:", error);
    return NextResponse.json({ 
      error: "Error al crear checkout",
      details: error.message 
    }, { status: 500 });
  }
}

// Webhook para recibir notificaciones de Mercado Pago
export async function PUT(request: Request) {
  try {
    const { type, data } = await request.json();

    console.log("🔔 Webhook recibido:", { type, data });

    if (type === "payment") {
      const paymentId = data.id;
      
      // Obtener información del pago
      const payment = await getPayment(paymentId);
      
      if (payment && payment.external_reference) {
        const orderId = payment.external_reference;
        let status = 'pending';

        // Mapear estados de Mercado Pago a nuestros estados
        switch (payment.status) {
          case 'approved':
            status = 'confirmed';
            break;
          case 'rejected':
            status = 'cancelled';
            break;
          case 'in_process':
            status = 'pending';
            break;
          default:
            status = 'pending';
        }

        // Actualizar orden en la base de datos
        await executeQuery(
          `UPDATE orders SET status = ?, payment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [status, paymentId, orderId]
        );

        console.log(`✅ Orden ${orderId} actualizada a estado: ${status}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ 
      error: "Error processing webhook",
      details: error.message 
    }, { status: 500 });
  }
}

// Endpoint para simular webhook en desarrollo
export async function GET(request: Request) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const orderId = searchParams.get('orderId');

  if (action === 'simulate-payment' && orderId) {
    console.log(`🎮 Simulando pago para orden: ${orderId}`);
    
    // Simular pago exitoso
    await executeQuery(
      `UPDATE orders SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [orderId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Pago simulado exitosamente',
      orderId 
    });
  }

  return NextResponse.json({ 
    endpoints: {
      'POST /api/checkout': 'Crear preferencia de pago',
      'PUT /api/checkout': 'Webhook Mercado Pago',
      'GET /api/checkout?action=simulate-payment&orderId=123': 'Simular pago (solo desarrollo)'
    }
  });
}