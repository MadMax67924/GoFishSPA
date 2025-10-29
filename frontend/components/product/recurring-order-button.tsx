"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface RecurringOrderButtonProps {
  product: Product;
  className?: string;
}

export default function RecurringOrderButton({ product, className = "" }: RecurringOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleCreateRecurringOrder = async () => {
    setIsLoading(true);

    try {
      // Verificar si el usuario está autenticado
      const authCheck = await fetch("/api/auth/check");
      if (!authCheck.ok) {
        setIsOpen(false);
        router.push("/login");
        return;
      }

      const userData = await authCheck.json();

      // Calcular fecha de inicio (7 días desde hoy)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const startDateString = startDate.toISOString().split('T')[0];

      // Obtener dirección de envío del usuario (simulado por ahora)
      const shippingAddress = {
        firstName: userData.user?.name?.split(' ')[0] || "Usuario",
        lastName: userData.user?.name?.split(' ')[1] || "GoFish",
        address: "Dirección del usuario",
        city: "Ciudad",
        region: "Región",
        postalCode: "1234567",
        phone: "+56912345678"
      };

      const response = await fetch("/api/recurring-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          frequency,
          interval_value: 1,
          next_delivery_date: startDateString,
          shipping_address: shippingAddress,
          payment_method: "mercado_pago",
          max_occurrences: null // Sin límite
        }),
      });

      if (response.ok) {
        alert("¡Compra recurrente programada exitosamente!");
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating recurring order:", error);
      alert("Error al programar compra recurrente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = async () => {
    // Verificar autenticación antes de abrir el modal
    try {
      const authCheck = await fetch("/api/auth/check");
      if (!authCheck.ok) {
        router.push("/login");
        return;
      }
      setIsOpen(true);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        variant="outline"
        className={`w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${className}`}
      >
        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Compra Recurrente
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h2 className="text-xl font-bold">Programar Compra Recurrente</h2>
            </div>

            {/* Información del producto */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-600">${product.price.toLocaleString()} c/u</p>
            </div>

            {/* Cantidad */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cantidad por entrega</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Frecuencia */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Frecuencia de entrega</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={frequency === 'weekly'}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="mr-2"
                  />
                  Semanal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="biweekly"
                    checked={frequency === 'biweekly'}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="mr-2"
                  />
                  Quincenal
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={frequency === 'monthly'}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="mr-2"
                  />
                  Mensual
                </label>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Primera entrega:</strong> En 7 días
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Recibirás {quantity} kg de {product.name} cada {frequency === 'weekly' ? 'semana' : frequency === 'biweekly' ? '2 semanas' : 'mes'}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRecurringOrder}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 px-4 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Programando..." : "Programar Compra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}