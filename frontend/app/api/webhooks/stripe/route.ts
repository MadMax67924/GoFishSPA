import { NextResponse } from "next/server"
import Stripe from "stripe"
import { executeQuery } from "@/lib/mysql"
import { generateInvoicePDF } from "@/lib/pdf-generator"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("❌ Error verificando webhook:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Procesar el evento de pago exitoso
  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log("✅ Pago exitoso recibido para sesión:", session.id)
      console.log("📦 Metadata:", session.metadata)

      const orderId = session.metadata?.order_id
      const orderNumber = session.metadata?.order_number

      if (!orderId) {
        console.error("❌ No se encontró order_id en metadata")
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 })
      }

      // 1. Actualizar orden en la base de datos
      const updateOrderSql = `
        UPDATE orders 
        SET 
          status = 'confirmed',
          stripe_payment_intent_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      await executeQuery(updateOrderSql, [session.id, orderId])
      console.log(`✅ Orden ${orderId} actualizada a 'confirmed'`)

      // 2. Obtener datos completos de la orden para el PDF
      const orderSql = `
        SELECT 
          o.*,
          oi.product_name,
          oi.product_price,
          oi.quantity,
          oi.subtotal as item_subtotal
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
      `
      const orderData = await executeQuery(orderSql, [orderId]) as any[]

      if (!orderData || orderData.length === 0) {
        throw new Error(`No se encontró la orden ${orderId}`)
      }

      // 3. Generar PDF de la factura
      console.log("📄 Generando PDF de factura...")
      const pdfBuffer = await generateInvoicePDF(orderData)

      // 4. Guardar PDF en el sistema de archivos
      const fs = require('fs')
      const path = require('path')
      
      const invoicesDir = path.join(process.cwd(), 'public', 'invoices')
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true })
      }

      const fileName = `factura-${orderNumber || orderId}.pdf`
      const filePath = path.join(invoicesDir, fileName)
      
      fs.writeFileSync(filePath, pdfBuffer)
      console.log(`✅ PDF guardado: ${filePath}`)

      // 5. Actualizar la orden con la ruta del PDF
      const updatePdfSql = `
        UPDATE orders 
        SET invoice_pdf_path = ?
        WHERE id = ?
      `
      await executeQuery(updatePdfSql, [`/invoices/${fileName}`, orderId])
      console.log(`✅ Ruta de PDF guardada en BD: /invoices/${fileName}`)

      console.log(`🎉 Proceso completado para orden ${orderId}`)

    } catch (error) {
      console.error("❌ Error procesando webhook:", error)
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}