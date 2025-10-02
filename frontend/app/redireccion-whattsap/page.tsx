"use client"

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation';

interface OrderItem {
    product_name: string;
    quantity: number;
}

interface Order {
    id: number;
    first_name: string;
    last_name: string;
    adress: string;
    city: string;
    region: string;
    postal_code: string;
    payment_method: string;
    total: number;
}

interface ApiResponse {
    order: Order;
    orderItems: OrderItem[];
    error?: string;
}

//recibe una orderId y cla ocupa para mandarsela al route y extraer los datos
export default function WhatsApp() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!orderId) {
            setError('No se proporcionó ID de orden');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/datos-whatsapp?orderId=${orderId}`);
            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al cargar la orden');
            }

            if (data.error) {
                throw new Error(data.error);
            }

            setOrder(data.order);
            setOrderItems(data.orderItems);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [orderId]);
    //Genera el mensaje con los datos extraidos y le genera una url para que se pueda acceder a el en el html
    const generateWhatsAppMessage = () => {
        if (!order) return '';
        
        let message = `¡Hola! Quiero confirmar mi orden #${order.id}\n\n`;
        message += `*Datos del pedido:*\n`;
        message += `👤 Nombre: ${order.first_name} ${order.last_name}\n`;
        message += `📍 Dirección: ${order.adress}, ${order.city}, ${order.region}\n`;
        message += `📮 Código Postal: ${order.postal_code}\n`;
        message += `💳 Método de pago: ${order.payment_method}\n\n`;
        
        message += `*Productos:*\n`;
        orderItems.forEach((item, index) => {
            message += `${index + 1}. ${item.product_name} (Cantidad: ${item.quantity})\n`;
        });
        
        message += `\n💰 *Total: $${order.total}*`;
        
        return encodeURIComponent(message);
    };

    const whatsappUrl = `https://wa.me/56963365895?text=${generateWhatsAppMessage()}`;

    if (loading) {
        return (
            <>
                <Header/>
                <main className="min-h-screen pt-24 pb-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
                            <p>Cargando información de la orden...</p>
                        </div>
                    </div>
                </main>
                <Footer/>
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Header/>
                <main className="min-h-screen pt-24 pb-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
                            <p className="text-red-600">{error || 'No se encontró la orden solicitada.'}</p>
                        </div>
                    </div>
                </main>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <Header/>
            <main className="min-h-screen pt-24 pb-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmar orden por WhatsApp</h2>
                        <div className="flex items-center justify-center space-x-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-green-800 mb-2">#{order.id}</div>
                                <div className="text-2xl font-bold text-green-600">${order.total}</div>
                                <div className="text-sm text-green-600 mt-2">
                                    {orderItems.length} producto{orderItems.length !== 1 ? 's' : ''} en la orden
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Datos del cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Nombre completo</p>
                                    <p className="font-medium">{order.first_name} {order.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Método de pago</p>
                                    <p className="font-medium">{order.payment_method}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">Dirección</p>
                                    <p className="font-medium">{order.adress}, {order.city}, {order.region}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Código Postal</p>
                                    <p className="font-medium">{order.postal_code}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Productos en la orden</h3>
                            <div className="space-y-3">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{item.product_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-2xl font-bold text-green-600">${order.total}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
                            <p className="text-gray-700 mb-4">
                                Contactenos por WhatsApp al número: <strong>+56963365895</strong> y
                            </p>
                            <p className="text-gray-700 mb-6">
                                adjunte el siguiente mensaje para continuar la compra
                            </p>
                            <a 
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors duration-200"
                            >
                                📱 Enviar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </>
    )
}