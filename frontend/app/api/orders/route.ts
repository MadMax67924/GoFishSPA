import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { executeQuery } from "@/lib/mysql"
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const {
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
      cartItems
    } = orderData

    if (!firstName || !lastName || !email || !phone || !address || !city || !region || !paymentMethod) {
      return NextResponse.json({ error: "Todos los campos requeridos deben ser completados" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cartId = cookieStore.get("cartId")?.value
    const token = cookieStore.get("authToken")?.value;

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        userId = decoded.userId;
      } catch (error) {
        console.error("Token inválido, continuando como usuario no autenticado:", error)
      }
    }

    if (!cartId) {
      return NextResponse.json({ error: "No hay carrito activo" }, { status: 400 })
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
    const shipping = subtotal > 30000 ? 0 : 5000
    const total = subtotal + shipping
    console.log(total)
    console.log(orderData.region)

    let status: string;
    if (paymentMethod === "webpay") {
      status = "pending";
    } else if (total < 30000 && region !== "Valparaíso") {
      status = "cancelled";
    } else {
      status = "confirmed";
    }

    const orderNumber = `GF-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const orderSql = `
      INSERT INTO orders (
        order_number, user_id, first_name, last_name, email, phone, address, city, region, 
        postal_code, payment_method, notes, subtotal, shipping, total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const orderResult = await executeQuery(orderSql, [
      orderNumber,
      userId,
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
      status,
    ])

    const orderId = (orderResult as any).insertId

    for (const item of cartItems as any[]) {
      const orderItemSql = `
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      const itemTotal = item.price * item.quantity
      await executeQuery(orderItemSql, [
        orderId,
        item.product_id,
        item.name,
        item.price,
        item.quantity,
        itemTotal,
      ])
    }

    cookieStore.set("cartId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })

    // 📨 ENVÍO DE CORREO DE CONFIRMACIÓN (ASÍNCRONO Y NO BLOQUEANTE)
    setTimeout(async () => {
      try {
        console.log("📦 Enviando correo de confirmación de pedido...")
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/confirm-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: `${firstName} ${lastName}`,
            orderNumber,
            total,
            items: cartItems.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        })

        const result = await response.json()
        console.log("✅ Respuesta del correo:", result)
      } catch (emailError) {
        console.error("❌ Error al enviar correo de confirmación:", emailError)
      }
    }, 100) // Pequeño delay para no bloquear

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