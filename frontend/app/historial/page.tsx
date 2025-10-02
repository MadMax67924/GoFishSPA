"use client"

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface OrderItem {
    order_id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    product_data?: {
        id: number;
        name: string;
        image: string;
        price: number;
        description?: string;
    };
}

interface GroupedOrder {
    order_id: number;
    items: OrderItem[];
    total: number;
}

//Primero extrae los items de datos-historial y despues cuando se apreta el boton de agregar a carrito ocupa handleAddToCart
export default function MostrarHistorial() {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<number | null>(null); 

    const fetchData = async () => {
        try {
            const response = await fetch('/api/datos-historial');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setOrderItems(data.orderItems || []);
            setError(null);
            
        } catch (err) {
            console.error('❌ Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    //Logica de carrito
    const addToCart = async (productId: number, quantity: number) => {
        setIsLoading(productId);
        try {
            console.log("Añadiendo al carrito:", { productId, quantity })

            const response = await fetch("/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: parseInt(productId.toString()),
                    quantity: quantity,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error("Error response:", data)
                toast.error(data.error || "Failed to add to cart.")
                return false
            }

            toast.success("Producto añadido al carrito!")

            window.dispatchEvent(new CustomEvent("cartUpdated"))
            window.dispatchEvent(new CustomEvent("productAdded"))

            try {
                const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")
                const existingItemIndex = currentCart.findIndex((item: any) => item.productId === productId)

                if (existingItemIndex > -1) {
                    currentCart[existingItemIndex].quantity += quantity
                } else {
                    currentCart.push({ productId, quantity })
                }

                localStorage.setItem("cart", JSON.stringify(currentCart))
            } catch (localStorageError) {
                console.warn("No se pudo actualizar localStorage:", localStorageError)
            }

            console.log("Producto añadido exitosamente")
            return true

        } catch (error: any) {
            console.error("Error adding to cart:", error)
            toast.error(error.message || "Algo salió mal al añadir al carrito.")
            return false
        } finally {
            setIsLoading(null)
        }
    }

    //Extrae los datos a agregar al carrito de order y los manda a addToCart
    const handleAddToCart = async (orderId: number) => {
        const order = groupedOrders.find(order => order.order_id === orderId);
        if (!order) return;

        setIsLoading(orderId); 

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const item of order.items) {
                const success = await addToCart(item.product_id, item.quantity);
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            if (errorCount === 0) {
                toast.success(`¡Todos los productos (${successCount}) añadidos al carrito!`);
            } else if (successCount > 0) {
                toast.warning(`${successCount} productos añadidos, ${errorCount} fallaron`);
            } else {
                toast.error("No se pudieron añadir los productos al carrito");
            }

        } catch (error) {
            console.error("Error adding order to cart:", error);
            toast.error("Error al procesar la orden completa");
        } finally {
            setIsLoading(null);
        }
    }

    //le pasa los datos a addToCart cuando es solo un item a agregar
    const handleAddSingleToCart = async (productId: number, quantity: number, productName: string) => {
        const success = await addToCart(productId, quantity);
        if (success) {
            toast.success(`"${productName}" añadido al carrito`);
        }
    }

    useEffect(() => {
        if (orderItems.length > 0) {
            const grouped = orderItems.reduce((acc: GroupedOrder[], item) => {
                const existingOrder = acc.find(order => order.order_id === item.order_id);
                
                if (existingOrder) {
                    existingOrder.items.push(item);
                    existingOrder.total += calculateItemTotal(item).total;
                } else {
                    acc.push({
                        order_id: item.order_id,
                        items: [item],
                        total: calculateItemTotal(item).total
                    });
                }
                return acc;
            }, []);
            
            setGroupedOrders(grouped);
        }
    }, [orderItems]);

    const calculateItemTotal = (item: OrderItem) => {
        const price = item.product_data?.price || 0;
        const subtotal = price * item.quantity;
        const shipping = subtotal > 30000 ? 0 : 5000;
        const total = subtotal + shipping;
        
        return { subtotal, shipping, total };
    };

    const calculateOrderTotal = (items: OrderItem[]) => {
        let subtotal = 0;
        let shippingTotal = 0;
        
        items.forEach(item => {
            const price = item.product_data?.price || 0;
            const itemSubtotal = price * item.quantity;
            const itemShipping = itemSubtotal > 30000 ? 0 : 5000;
            
            subtotal += itemSubtotal;
            shippingTotal += itemShipping;
        });
        
        return {
            subtotal,
            shipping: shippingTotal,
            total: subtotal + shippingTotal
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-lg">Cargando historial...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-red-600 text-lg">Error: {error}</div>
                    <button 
                        onClick={fetchData}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (orderItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Historial de Pedidos</h1>
                    <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-600 text-lg">No hay pedidos en tu historial</p>
                        <p className="text-gray-500 mt-2">Realiza tu primera compra para verla aquí</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Historial de Pedidos</h1>
                
                <div className="space-y-6">
                    {groupedOrders.map((order) => {
                        const orderTotal = calculateOrderTotal(order.items);
                        
                        return (
                            <div key={order.order_id} 
                                 className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                
                                <div className="mb-6 pb-4 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Orden #{order.order_id}
                                    </h2>
                                </div>
                                
                                <div className="space-y-4 mb-6">
                                    {order.items.map((orderItem) => {
                                        const itemTotal = calculateItemTotal(orderItem);
                                        const product = orderItem.product_data;
                                        
                                        return (
                                            <div key={`${orderItem.order_id}-${orderItem.product_id}`} 
                                                 className="flex flex-col md:flex-row justify-between items-start gap-6 p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <img
                                                        src={product?.image || '/placeholder-image.jpg'}
                                                        alt={product?.name || orderItem.product_name}
                                                        className="w-20 h-20 object-cover rounded-lg border"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                            {product?.name || orderItem.product_name}
                                                        </h3>
                                                        <div className="space-y-1 text-gray-600 text-sm">
                                                            <p><span className="font-medium">Cantidad:</span> {orderItem.quantity}</p>
                                                            {product?.description && (
                                                                <p className="text-gray-500">{product.description}</p>
                                                            )}
                                                        </div>
                                                        {product && (
                                                            <p className="text-gray-700 font-medium mt-2">
                                                                ${product.price.toLocaleString()} c/u
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="w-full md:w-auto flex flex-col gap-3">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <div className="space-y-1 text-sm">
                                                            <p className="text-gray-600">
                                                                <span className="font-medium">Subtotal:</span> ${itemTotal.subtotal.toLocaleString()}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                <span className="font-medium">Envío:</span> ${itemTotal.shipping.toLocaleString()}
                                                            </p>
                                                            <div className="border-t border-gray-200 pt-1">
                                                                <p className="font-bold text-green-700">
                                                                    Total: ${itemTotal.total.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => handleAddSingleToCart(
                                                            orderItem.product_id, 
                                                            orderItem.quantity, 
                                                            product?.name || orderItem.product_name
                                                        )}
                                                        disabled={isLoading === orderItem.product_id}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                                                    >
                                                        {isLoading === orderItem.product_id ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                Añadiendo...
                                                            </span>
                                                        ) : (
                                                            "Añadir al Carrito"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-200">
                                    <div className="flex-1">
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                                            <div className="space-y-2 text-sm">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Subtotal orden:</span> ${orderTotal.subtotal.toLocaleString()}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Envío total:</span> ${orderTotal.shipping.toLocaleString()}
                                                </p>
                                                <div className="border-t border-green-200 pt-2">
                                                    <p className="text-lg font-bold text-green-800">
                                                        Total orden: ${orderTotal.total.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleAddToCart(order.order_id)}
                                        disabled={isLoading === order.order_id}
                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                    >
                                        {isLoading === order.order_id ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Procesando...
                                            </>
                                        ) : (
                                            `Agregar Todos (${order.items.length}) al Carrito`
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Footer />
        </div>
    );
}