import { NextResponse } from "next/server"
import { getProductById } from "@/lib/products-data"

// Simulación de carrito en memoria para el servidor
const serverCarts = new Map<string, any[]>()

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
    const enrichedItems = cartItems.map((item) => {
      const product = getProductById(item.productId)
      return {
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        name: product?.name || "Producto no encontrado",
        price: product?.price || 0,
        image: product?.image || "/placeholder.svg",
      }
    })

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
    cartItems = cartItems.filter((item) => item.id !== itemId)
    serverCarts.set(cartId, cartItems)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar item del carrito:", error)
    return NextResponse.json({ error: "Error al eliminar item del carrito" }, { status: 500 })
  }
}
