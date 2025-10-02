import { executeQuery } from '@/lib/mysql';
import { NextResponse } from 'next/server';
import { cookies } from "next/headers"
import jwt from "jsonwebtoken";
import { getProductById } from '@/lib/server/products-data';

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

interface Order {
    id: number;
}

interface OrderItem {
    order_id: number;
    product_id: number;
    product_name: string;
    quantity: number;
}

interface ProductData {
    id: number;
    name: string;
    image: string;
    price: number;
    description?: string;
}

interface EnrichedOrderItem extends OrderItem {
    product_data?: ProductData;
}

//Primero extrae el authToken de la cuenta actual, despues extrae de la base de datos, 
// todas las id de las ordenes que tienen el mismo user_id que el token,
//despues extrae todos los cart_items que compartan la order_id de las ordenes extraidas
//por ultimo se extrae los datos de cada producto y se manda todo esto devuelta
export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value;
    
    if (!token) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        const userId = decoded.userId;
        
        const orders = await executeQuery(
            `SELECT id FROM orders 
            WHERE user_id = ? AND status = "confirmed"
            ORDER BY id DESC`,
            [userId]
        ) as Order[];

        if (!Array.isArray(orders) || orders.length === 0) {
            return NextResponse.json({ orderItems: [] });
        }

        const orderIds = orders.map(order => order.id);
        
        const placeholders = orderIds.map(() => '?').join(',');
        const orderItems = await executeQuery(
            `SELECT order_id, product_id, product_name, quantity
            FROM order_items
            WHERE order_id IN (${placeholders})
            ORDER BY order_id DESC`,
            orderIds
        ) as OrderItem[];

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return NextResponse.json({ orderItems: [] });
        }

        const enrichedOrderItems: EnrichedOrderItem[] = await Promise.all(
            orderItems.map(async (item): Promise<EnrichedOrderItem> => {
                try {
                    const product = await getProductById(item.product_id);
                    
                    if (product && product.id && product.name && product.image && product.price) {
                        const productData: ProductData = {
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            price: product.price,
                            description: product.description
                        };
                        
                        return {
                            ...item,
                            product_data: productData
                        };
                    } else {
                        return item;
                    }
                } catch (error) {
                    return item;
                }
            })
        );

        return NextResponse.json({
            orderItems: enrichedOrderItems
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }
        
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}