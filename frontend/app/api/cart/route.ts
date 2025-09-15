import { NextResponse } from "next/server"
import { getProductById } from "@/lib/server/products-data"

// Simulación de carrito en memoria para el servidor - COMPARTIDA
export const serverCarts = new Map<string, any[]>()

function getCartId(request: Request): string {
  const cookieHeader = request.headers.get("cookie") || ""
  const cartIdMatch = cookieHeader.match(/cartId=([^;]+)/)
  return cartIdMatch ? cartIdMatch[1] : `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function GET(request: Request) {
  try {
    const cartId = getCartId(request)
    const cartItems = serverCarts.get(cartId) || []

    // Enriquecer items con información del producto actualizada
    const enrichedItems = cartItems
      .map((item) => {
        const product = getProductById(item.productId)
        if (!product) {
          console.warn(`Producto ${item.productId} no encontrado`)
          return null
        }
        return {
          id: item.id,
          product_id: item.productId,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          image: product.image,
        }
      })
      .filter(Boolean) // Remover items null

    return NextResponse.json({ items: enrichedItems })
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()
    const cartId = getCartId(request)

    const cartItems = serverCarts.get(cartId) || []

    // Verificar si el producto existe
    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex((item) => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Actualizar cantidad
      cartItems[existingItemIndex].quantity += quantity
    } else {
      // Añadir nuevo item
      const newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      }
      cartItems.push(newItem)
    }

    serverCarts.set(cartId, cartItems)

    // Pequeño delay para asegurar consistencia
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Log para debug
    console.log(`Carrito ${cartId} actualizado:`, cartItems.length, "items")

    const response = NextResponse.json({ success: true })
    response.cookies.set("cartId", cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Error al añadir al carrito:", error)
    return NextResponse.json({ error: "Error al añadir al carrito" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { itemId, quantity } = await request.json()
    const cartId = getCartId(request)

    let cartItems = serverCarts.get(cartId) || []

    if (quantity <= 0) {
      // Eliminar item
      cartItems = cartItems.filter((item) => item.id !== itemId)
    } else {
      // Actualizar cantidad
      const itemIndex = cartItems.findIndex((item) => item.id === itemId)
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = quantity
      }
    }

    serverCarts.set(cartId, cartItems)

    // Pequeño delay para asegurar consistencia
    await new Promise((resolve) => setTimeout(resolve, 50))

    console.log(`Carrito ${cartId} cantidad actualizada`)
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
    const cartId = getCartId(request)

    if (!itemId) {
      return NextResponse.json({ error: "ID del item requerido" }, { status: 400 })
    }

    let cartItems = serverCarts.get(cartId) || []
    const originalLength = cartItems.length

    cartItems = cartItems.filter((item) => item.id !== itemId)

    // Si se eliminó un item, actualizar el carrito
    if (cartItems.length < originalLength) {
      if (cartItems.length === 0) {
        // Si no quedan items, eliminar completamente el carrito
        serverCarts.delete(cartId)
        console.log(`Carrito ${cartId} completamente eliminado - sin items restantes`)
      } else {
        serverCarts.set(cartId, cartItems)
        console.log(`Item ${itemId} eliminado del carrito ${cartId}. Items restantes: ${cartItems.length}`)
      }
    }

    return NextResponse.json({
      success: true,
      itemsRemaining: cartItems.length,
      cartDeleted: cartItems.length === 0,
    })
  } catch (error) {
    console.error("Error al eliminar item del carrito:", error)
    return NextResponse.json({ error: "Error al eliminar item del carrito" }, { status: 500 })
  }
}
