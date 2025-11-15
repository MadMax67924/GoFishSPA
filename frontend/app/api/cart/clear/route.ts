import { NextResponse } from "next/server"
import { executeQuery } from '@/lib/mysql';

// Acceso a la misma instancia de memoria que usa el carrito principal

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
    const delSQL = await executeQuery(`
            DELETE FROM cart_items
            WHERE cart_id = ?
            `, [cartId])
    if (!delSQL) throw new Error("Error eliminando item")
    // Crear respuesta y eliminar la cookie
    const response = NextResponse.json({
      success: true,
      message: "Carrito completamente eliminado",
    })

    // Eliminar la cookie del carrito
    response.cookies.delete("cartId")

    return response
  } catch (error) {
    console.error("Error al limpiar carrito:", error)
    return NextResponse.json({ error: "Error al limpiar carrito" }, { status: 500 })
  }
}
