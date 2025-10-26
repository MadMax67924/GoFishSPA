import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
//Extrae los datos asociados a la order_id de la base de datos mediante executeQuery 
// y despues los retorna de manera ordenada

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

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

    const orderResult = await executeQuery(orderSql, [orderId])

    if (!orderResult || (orderResult as any).length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const orderRows = orderResult as any[]
    const order = {
      id: orderRows[0].id,
      order_number: orderRows[0].order_number,
      first_name: orderRows[0].first_name,
      last_name: orderRows[0].last_name,
      email: orderRows[0].email,
      phone: orderRows[0].phone,
      address: orderRows[0].address,
      city: orderRows[0].city,
      region: orderRows[0].region,
      postal_code: orderRows[0].postal_code,
      payment_method: orderRows[0].payment_method,
      notes: orderRows[0].notes,
      subtotal: orderRows[0].subtotal,
      shipping: orderRows[0].shipping,
      total: orderRows[0].total,
      status: orderRows[0].status,
      stripe_payment_intent_id: orderRows[0].stripe_payment_intent_id,
      created_at: orderRows[0].created_at,
      items: orderRows
        .filter(row => row.product_id)
        .map(row => ({
          product_id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          quantity: row.quantity,
          subtotal: row.item_subtotal
        }))
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}