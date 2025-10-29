import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { generateDocumentPDF } from "@/lib/document-generator"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Obtener información de la orden
    const orderSql = `
      SELECT 
        o.*,
        oi.product_id,
        oi.product_name,
        oi.product_price,
        oi.quantity,
        oi.subtotal as item_subtotal
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
    `

    const orders = await executeQuery(orderSql, [orderId])

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    // Formatear datos para el PDF
    const order = orders[0] as any
    const items = orders.map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: item.product_price,
      total: item.item_subtotal
    }))

    const documentData = {
      orderNumber: order.order_number,
      orderDate: new Date(order.created_at).toLocaleDateString('es-CL'),
      customerName: `${order.first_name} ${order.last_name}`,
      customerEmail: order.email,
      customerAddress: order.address,
      customerCity: order.city,
      customerRegion: order.region,
      customerPhone: order.phone,
      items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      documentType: order.document_type,
      rut: order.rut || undefined,
      businessName: order.business_name || undefined
    }

    // Generar PDF
    const pdfBuffer = await generateDocumentPDF(documentData)

    // Devolver PDF como respuesta
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${order.order_number}-${order.document_type}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generando documento:", error)
    return NextResponse.json({ error: "Error al generar documento" }, { status: 500 })
  }
}