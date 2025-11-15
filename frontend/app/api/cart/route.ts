import { NextResponse } from "next/server"
import { executeQuery } from '@/lib/mysql';

// Simulación de carrito en memoria para el servidor - COMPARTIDA

function getCartId(request: Request): string {
  const cookieHeader = request.headers.get("cookie") || ""
  const cartIdMatch = cookieHeader.match(/cartId=([^;]+)/)
  return cartIdMatch ? cartIdMatch[1] : `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function GET(request: Request) {
  try {
    const cartId = getCartId(request)

    // Enriquecer items con información del producto actualizada
    const query = `
      SELECT 
        ci.id,
        ci.quantity,
        ci.product_id,
        ci.is_preorder,
        p.name,
        p.price,
        p.image
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    
    const cartItems = await executeQuery(query, [cartId]);

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error("Error al obtener carrito:", error)
    return NextResponse.json({ error: "Error al obtener carrito" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity, isPreOrder } = await request.json() // ← NUEVO: Recibir isPreOrder
    const cartId = getCartId(request)

    const query = `
      SELECT 
        ci.id,
        ci.quantity,
        ci.product_id,
        ci.is_preorder,
        p.name,
        p.price,
        p.image
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ? AND ci.product_id = ?
    `;
    
    const cartItem = await executeQuery(query, [cartId, productId]) as {
      id: number;
      quantity: number;
      product_id: number;
      is_preorder: boolean;
      name: string;
      price: number;
      image: string;
    }[];

    if (cartItem && cartItem.length > 0) {
      const cantidad = cartItem[0].quantity + 1;
      const add = await executeQuery(`
      UPDATE cart_items SET quantity = ? WHERE cart_id = ? 
      `, [cantidad, cartId])
      if(!add){
        console.error("Error al actualizar carrito")
      }
    } else {
      const put = await executeQuery(`
      INSERT INTO cart_items (cart_id, product_id, quantity) 
      VALUES (?, ?, ?)
      `, [cartId, productId, quantity])
      if(!put){
        console.error("Error al actualizar carrito")
      }
    }


    // Pequeño delay para asegurar consistencia
    await new Promise((resolve) => setTimeout(resolve, 50))

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

    if (quantity <= 0) {
      const delSQL = await executeQuery(`
            DELETE FROM cart_items
            WHERE cart_id = ? AND id = ?
            `, [cartId, itemId])
      if (!delSQL) throw new Error("Error eliminando item")
    } else {
      console.log(itemId)
      const apSQL = await executeQuery(`
            UPDATE cart_items
            SET quantity = ?
            WHERE cart_id = ? AND id = ?
            `, [quantity, cartId, itemId])
      if (!apSQL) throw new Error("Error actualizando cantidad")
    }

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

    const query = `
      SELECT 
        ci.id,
        ci.quantity,
        ci.product_id,
        ci.is_preorder,
        p.name,
        p.price,
        p.image
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    
    const cartItems = await executeQuery(query, [cartId]);

    const delSQL = await executeQuery(`
            DELETE FROM cart_items
            WHERE cart_id = ? AND id = ?
            `, [cartId, itemId])
    if (!delSQL) throw new Error("Error eliminando item")
  
    if (!cartItems) {
      const response = NextResponse.json({
            success: true,
            message: "Carrito completamente eliminado",
          })
      
      response.cookies.delete("cartId")
      return response
    }
  

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error al eliminar item del carrito:", error)
    return NextResponse.json({ error: "Error al eliminar item del carrito" }, { status: 500 })
  }
}