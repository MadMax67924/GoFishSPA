import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    // 1. Obtener datos de la orden
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
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    console.log("📄 Generando PDF para orden:", orderData[0].order_number)

    // 2. Generar PDF
    const pdfBuffer = await generateInvoicePDF(orderData)

    // 3. Guardar PDF
    const invoicesDir = path.join(process.cwd(), 'public', 'invoices')
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true })
    }

    const fileName = `factura-${orderData[0].order_number}.pdf`
    const filePath = path.join(invoicesDir, fileName)
    
    fs.writeFileSync(filePath, pdfBuffer)
    console.log("✅ PDF guardado:", filePath)

    // 4. Actualizar BD
    const updateSql = `UPDATE orders SET invoice_pdf_path = ? WHERE id = ?`
    await executeQuery(updateSql, [`/invoices/${fileName}`, orderId])

    return NextResponse.json({ 
      success: true, 
      message: "PDF generado", 
      filePath: `/invoices/${fileName}` 
    })

  } catch (error) {
    console.error("❌ Error generando PDF:", error)
    return NextResponse.json({ error: "Error generando PDF" }, { status: 500 })
  }
}
