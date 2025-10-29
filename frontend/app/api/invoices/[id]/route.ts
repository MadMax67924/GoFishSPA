import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import fs from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Obtener información de la orden
    const orderSql = `
      SELECT invoice_pdf_path, order_number 
      FROM orders 
      WHERE id = ?
    `
    const orders = await executeQuery(orderSql, [orderId]) as any[]

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    const order = orders[0]

    if (!order.invoice_pdf_path) {
      return NextResponse.json({ error: "Factura no generada para esta orden" }, { status: 404 })
    }

    // Construir ruta del archivo
    const filePath = path.join(process.cwd(), 'public', order.invoice_pdf_path)

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo de factura no encontrado" }, { status: 404 })
    }

    // Leer el archivo
    const fileBuffer = fs.readFileSync(filePath)

    // Devolver el PDF
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${order.order_number}.pdf"`,
      },
    })

  } catch (error) {
    console.error("Error descargando factura:", error)
    return NextResponse.json({ error: "Error al descargar factura" }, { status: 500 })
  }
}