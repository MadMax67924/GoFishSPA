import { NextResponse } from "next/server"

// Acceso a la misma instancia de memoria que usa el carrito principal
const serverCarts = new Map<string, any[]>()

function getCartId(request: Request): string {
  const cookieHeader = request.headers.get("cookie") || ""
  const cartIdMatch = cookieHeader.match(/cartId=([^;]+)/)
  return cartIdMatch ? cartIdMatch[1] : ""
}

export async function DELETE(request: Request) {
  try {
    const cartId = getCartId(request)

    if (!cartId) {
      return NextResponse.json({ error: "No se encontró ID de carrito" }, { status: 400 })
    }

    // Eliminar completamente el carrito de la memoria
    serverCarts.delete(cartId)

    // Log para debug
    console.log(`Carrito ${cartId} completamente eliminado de memoria`)
    console.log(`Carritos restantes en memoria: ${serverCarts.size}`)

    // Crear respuesta y eliminar la cookie
    const response = NextResponse.json({
      success: true,
      message: "Carrito completamente eliminado",
      remainingCarts: serverCarts.size,
    })

    // Eliminar la cookie del carrito
    response.cookies.delete("cartId")

    return response
  } catch (error) {
    console.error("Error al limpiar carrito:", error)
    return NextResponse.json({ error: "Error al limpiar carrito" }, { status: 500 })
  }
}
