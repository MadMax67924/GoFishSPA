import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

//Extrea de la base de datos requerido a mostrar en el mensaje de whattsap ocupando la order id
//  y lo devuelve como array
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const order = await executeQuery(
      `SELECT id, first_name, last_name, address, city, region, postal_code, payment_method, total
       FROM orders 
       WHERE id = ?`,
      [orderId]
    );

    const orderItems = await executeQuery(
      `SELECT product_name, quantity
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    );

    if (Array.isArray(order) && order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: Array.isArray(order) ? order[0] : order,
      orderItems: Array.isArray(orderItems) ? orderItems : []
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
