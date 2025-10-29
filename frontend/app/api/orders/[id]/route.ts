import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    const sql = `
      SELECT 
        id, order_number, total, status, invoice_pdf_path, created_at
      FROM orders 
      WHERE id = ?
    `

    const orders = await executeQuery(sql, [orderId]) as any[]

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(orders[0])
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Error fetching order" }, { status: 500 })
  }
}