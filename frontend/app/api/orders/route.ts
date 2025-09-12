import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { executeQuery } from "@/lib/mysql"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const { firstName, lastName, email, phone, address, city, region, postalCode, paymentMethod, notes } = orderData

    // Validar datos requeridos
    if (!firstName || !lastName || !email || !phone || !address || !city || !region || !paymentMethod) {
      return NextResponse.json({ error: "Todos los campos requeridos deben ser completados" }, { status: 400 })
    }

    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ error: "No hay carrito activo" }, { status: 400 })
    }

    // Obtener el carrito y sus items
    const cartSql = "SELECT id FROM carts WHERE cart_id = ?"
    const carts = await executeQuery(cartSql, [cartId])

    if (!Array.isArray(carts) || carts.length === 0) {
      return NextResponse.json({ error: "Carrito no encontrado" }, { status: 404 })
    }

    const cart = carts[0] as any

    // Obtener items del carrito
    const itemsSql = `
      SELECT 
        ci.quantity,
        p.id as product_id,
        p.name as product_name,
        p.price as product_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `

    const items = await executeQuery(itemsSql, [cart.id])

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    // Calcular totales
    const subtotal = (items as any[]).reduce((acc, item) => acc + item.product_price * item.quantity, 0)
    const shipping = subtotal > 30000 ? 0 : 5000
    const total = subtotal + shipping

    // Generar número de pedido
    const orderNumber = `GF-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Crear el pedido
    const orderSql = `
      INSERT INTO orders (
        order_number, first_name, last_name, email, phone, address, city, region, 
        postal_code, payment_method, notes, subtotal, shipping, total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `

    const orderResult = await executeQuery(orderSql, [
      orderNumber,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      region,
      postalCode,
      paymentMethod,
      notes,
      subtotal,
      shipping,
      total,
    ])

    const orderId = (orderResult as any).insertId

    // Crear los items del pedido
    for (const item of items as any[]) {
      const orderItemSql = `
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      await executeQuery(orderItemSql, [
        orderId,
        item.product_id,
        item.product_name,
        item.product_price,
        item.quantity,
        item.product_price * item.quantity,
      ])
    }

    // Limpiar el carrito
    await executeQuery("DELETE FROM cart_items WHERE cart_id = ?", [cart.id])
    await executeQuery("DELETE FROM carts WHERE id = ?", [cart.id])

    // Limpiar cookie del carrito
    cookies().set("cartId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      total,
    })
  } catch (error) {
    console.error("Error al crear pedido:", error)
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sql = `
      SELECT 
        id, order_number, first_name, last_name, email, total, status, created_at
      FROM orders 
      ORDER BY created_at DESC
    `

    const orders = await executeQuery(sql)

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}
