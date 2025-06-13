import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { executeQuery } from "@/lib/mysql"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cartId = cookieStore.get("cartId")?.value

    if (!cartId) {
      return NextResponse.json({ items: [] })
    }

    // Buscar el carrito
    const cartSql = "SELECT id FROM carts WHERE cart_id = ?"
    const carts = await executeQuery(cartSql, [cartId])

    if (!Array.isArray(carts) || carts.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const cart = carts[0] as any

    // Obtener los items del carrito con información del producto
    const itemsSql = `
      SELECT 
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at ASC
    `

    const items = await executeQuery(itemsSql, [cart.id])

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()
    const cookieStore = cookies()
    let cartId = cookieStore.get("cartId")?.value

    // Si no hay cartId, crear uno nuevo
    if (!cartId) {
      cartId = uuidv4()
      cookies().set("cartId", cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      })
    }

    // Buscar o crear el carrito
    const cartSql = "SELECT id FROM carts WHERE cart_id = ?"
    const carts = await executeQuery(cartSql, [cartId])

    let cartDbId: number

    if (!Array.isArray(carts) || carts.length === 0) {
      // Crear nuevo carrito
      const insertCartSql = "INSERT INTO carts (cart_id) VALUES (?)"
      const result = await executeQuery(insertCartSql, [cartId])
      cartDbId = (result as any).insertId
    } else {
      cartDbId = (carts[0] as any).id
    }

    // Verificar si el producto ya está en el carrito
    const existingItemSql = "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?"
    const existingItems = await executeQuery(existingItemSql, [cartDbId, productId])

    if (Array.isArray(existingItems) && existingItems.length > 0) {
      // Actualizar cantidad
      const existingItem = existingItems[0] as any
      const newQuantity = existingItem.quantity + quantity
      const updateSql = "UPDATE cart_items SET quantity = ? WHERE id = ?"
      await executeQuery(updateSql, [newQuantity, existingItem.id])
    } else {
      // Añadir nuevo item
      const insertItemSql = "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)"
      await executeQuery(insertItemSql, [cartDbId, productId, quantity])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al añadir al carrito:", error)
    return NextResponse.json({ error: "Error al añadir al carrito" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { itemId, quantity } = await request.json()

    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el item
      const deleteSql = "DELETE FROM cart_items WHERE id = ?"
      await executeQuery(deleteSql, [itemId])
    } else {
      // Actualizar cantidad
      const updateSql = "UPDATE cart_items SET quantity = ? WHERE id = ?"
      await executeQuery(updateSql, [quantity, itemId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar carrito:", error)
    return NextResponse.json({ error: "Error al actualizar carrito" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "ID del item requerido" }, { status: 400 })
    }

    const deleteSql = "DELETE FROM cart_items WHERE id = ?"
    await executeQuery(deleteSql, [itemId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar item del carrito:", error)
    return NextResponse.json({ error: "Error al eliminar item del carrito" }, { status: 500 })
  }
}
