import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

//Actualiza el estado de la orden a status
export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      )
    }

    const updateSql = `UPDATE orders SET status = ? WHERE id = ?`
    await executeQuery(updateSql, [status, orderId])

    const orderSql = `SELECT order_number FROM orders WHERE id = ?`
    const orderResult = await executeQuery(orderSql, [orderId]) as any[]

    return NextResponse.json({
      success: true,
      orderNumber: orderResult[0]?.order_number
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "Error updating order status" },
      { status: 500 }
    )
  }
}