import { executeQuery } from "@/lib/mysql";
import { mercadoPago } from "@/lib/payment-provider";

export interface RecurringOrderData {
  user_id: number;
  product_id: number;
  quantity: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  interval_value?: number;
  next_delivery_date: string;
  shipping_address: any;
  payment_method: string;
  card_token?: string;
  max_occurrences?: number;
}

export interface ProcessedRecurringOrder {
  success: boolean;
  orderId?: number;
  error?: string;
}

// Crear suscripción recurrente
export async function createRecurringOrder(data: RecurringOrderData) {
  try {
    const sql = `
      INSERT INTO recurring_orders (
        user_id, product_id, quantity, frequency, interval_value,
        next_delivery_date, shipping_address, payment_method, card_token,
        max_occurrences, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    const result = await executeQuery(sql, [
      data.user_id,
      data.product_id,
      data.quantity,
      data.frequency,
      data.interval_value || 1,
      data.next_delivery_date,
      JSON.stringify(data.shipping_address),
      data.payment_method,
      data.card_token || null,
      data.max_occurrences || null
    ]);

    return {
      success: true,
      recurringOrderId: (result as any).insertId
    };
  } catch (error) {
    console.error('Error creating recurring order:', error);
    throw error;
  }
}

// Procesar órdenes recurrentes pendientes
export async function processPendingRecurringOrders() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const sql = `
      SELECT 
        ro.*,
        p.name as product_name,
        p.price as product_price,
        u.email as user_email,
        u.name as user_name
      FROM recurring_orders ro
      JOIN products p ON ro.product_id = p.id
      JOIN users u ON ro.user_id = u.id
      WHERE ro.status = 'active' 
        AND ro.next_delivery_date <= ?
        AND (ro.max_occurrences IS NULL OR ro.occurrences_count < ro.max_occurrences)
    `;

    const pendingOrders = await executeQuery(sql, [today]) as any[];

    const results: ProcessedRecurringOrder[] = [];

    for (const order of pendingOrders) {
      try {
        // Crear orden a partir de la recurrente
        const orderResult = await createOrderFromRecurring(order);
        
        if (orderResult.success) {
          // Actualizar próxima fecha de entrega
          await updateNextDeliveryDate(order.id, order.frequency, order.interval_value);
          
          // Incrementar contador
          await executeQuery(
            'UPDATE recurring_orders SET occurrences_count = occurrences_count + 1, last_processed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [order.id]
          );

          // Log exitoso
          await executeQuery(
            'INSERT INTO recurring_order_logs (recurring_order_id, order_id, status) VALUES (?, ?, ?)',
            [order.id, orderResult.orderId, 'success']
          );
        }

        results.push(orderResult);
      } catch (error) {
        console.error(`Error processing recurring order ${order.id}:`, error);
        
        // Log de error
        await executeQuery(
          'INSERT INTO recurring_order_logs (recurring_order_id, order_id, status, error_message) VALUES (?, NULL, ?, ?)',
          [order.id, 'failed', error instanceof Error ? error.message : 'Unknown error']
        );

        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error processing recurring orders:', error);
    throw error;
  }
}

// Crear orden a partir de recurrente
async function createOrderFromRecurring(recurringOrder: any): Promise<ProcessedRecurringOrder> {
  const shippingAddress = JSON.parse(recurringOrder.shipping_address);
  
  // Calcular totales
  const subtotal = recurringOrder.product_price * recurringOrder.quantity;
  const shipping = subtotal > 30000 ? 0 : 5000;
  const total = subtotal + shipping;

  const orderNumber = `GF-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    // Crear orden en la base de datos
    const orderSql = `
      INSERT INTO orders (
        order_number, user_id, first_name, last_name, email, phone, address, city, region, 
        postal_code, payment_method, subtotal, shipping, total, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'approved')
    `;

    const orderResult = await executeQuery(orderSql, [
      orderNumber,
      recurringOrder.user_id,
      shippingAddress.firstName,
      shippingAddress.lastName,
      recurringOrder.user_email,
      shippingAddress.phone,
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.region,
      shippingAddress.postalCode,
      recurringOrder.payment_method,
      subtotal,
      shipping,
      total
    ]);

    const orderId = (orderResult as any).insertId;

    // Crear items de la orden
    const orderItemSql = `
      INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(orderItemSql, [
      orderId,
      recurringOrder.product_id,
      recurringOrder.product_name,
      recurringOrder.product_price,
      recurringOrder.quantity,
      subtotal
    ]);

    // TODO: Aquí integrar con Mercado Pago para pago automático si hay card_token
    if (recurringOrder.card_token) {
      // Implementar pago automático con tarjeta guardada
      console.log(`Procesando pago automático para orden recurrente ${orderId}`);
    }

    return {
      success: true,
      orderId
    };
  } catch (error) {
    console.error('Error creating order from recurring:', error);
    throw error;
  }
}

// Actualizar próxima fecha de entrega
async function updateNextDeliveryDate(recurringOrderId: string, frequency: string, interval: number = 1) {
  let nextDate = new Date();
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + (14 * interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7);
  }

  const nextDateString = nextDate.toISOString().split('T')[0];

  await executeQuery(
    'UPDATE recurring_orders SET next_delivery_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nextDateString, recurringOrderId]
  );
}

// Obtener suscripciones activas del usuario
export async function getUserRecurringOrders(userId: number) {
  const sql = `
    SELECT 
      ro.*,
      p.name as product_name,
      p.price as product_price,
      p.image as product_image
    FROM recurring_orders ro
    JOIN products p ON ro.product_id = p.id
    WHERE ro.user_id = ? AND ro.status = 'active'
    ORDER BY ro.next_delivery_date ASC
  `;

  const orders = await executeQuery(sql, [userId]) as any[];
  
  return orders.map(order => ({
    ...order,
    shipping_address: JSON.parse(order.shipping_address)
  }));
}

// Pausar/cancelar suscripción
export async function updateRecurringOrderStatus(recurringOrderId: string, status: 'active' | 'paused' | 'cancelled') {
  await executeQuery(
    'UPDATE recurring_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, recurringOrderId]
  );

  return { success: true };
}