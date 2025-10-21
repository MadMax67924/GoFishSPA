import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key";

// Obtener orden específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;

    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

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
    `;

    const orders = await executeQuery(orderSql, [orderId]);

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario tenga acceso a esta orden
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const order = orders[0] as any;
        
        if (order.user_id && order.user_id !== parseInt(decoded.userId)) {
          return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
      } catch (error) {
        // Token inválido, pero permitir acceso si la orden no tiene usuario
        const order = orders[0] as any;
        if (order.user_id) {
          return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
      }
    }

    // Formatear respuesta
    const orderData = {
      id: orders[0].id,
      order_number: orders[0].order_number,
      status: orders[0].status,
      total: orders[0].total,
      created_at: orders[0].created_at,
      items: orders.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        item_subtotal: item.item_subtotal,
      }))
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Error obteniendo orden:", error);
    return NextResponse.json({ error: "Error al obtener orden" }, { status: 500 });
  }
}

// Actualizar orden (cancelar, etc.)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Estado requerido" }, { status: 400 });
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    await executeQuery(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, orderId]
    );

    return NextResponse.json({ success: true, message: "Orden actualizada" });
  } catch (error) {
    console.error("Error actualizando orden:", error);
    return NextResponse.json({ error: "Error al actualizar orden" }, { status: 500 });
  }
}