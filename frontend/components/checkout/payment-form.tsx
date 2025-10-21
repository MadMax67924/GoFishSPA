"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Save, Lock } from "lucide-react";

interface PaymentFormProps {
  orderId: number;
  total: number;
  onPaymentSuccess: (paymentData: any) => void;
  savedCards?: Array<{
    id: string;
    last_four_digits: string;
    expiration_month: number;
    expiration_year: number;
    cardholder_name: string;
  }>;
}

export default function PaymentForm({ orderId, total, onPaymentSuccess, savedCards = [] }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string>("");

  const handleMercadoPagoPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Redirigir a Mercado Pago
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          items: [{ name: `Orden #${orderId}`, quantity: 1, price: total }],
        }),
      });

      const data = await response.json();

      if (data.initPoint) {
        // Redirigir a Mercado Pago
        window.location.href = process.env.NODE_ENV === 'development' 
          ? data.sandboxInitPoint 
          : data.initPoint;
      } else {
        throw new Error("No se pudo inicializar el pago");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavedCardPayment = async () => {
    if (!selectedCard) {
      alert("Selecciona una tarjeta guardada");
      return;
    }

    setIsProcessing(true);
    // Aquí implementarías el pago con tarjeta guardada
    // usando el token de la tarjeta
    setTimeout(() => {
      setIsProcessing(false);
      alert("Pago con tarjeta guardada - Esta funcionalidad requiere configuración adicional");
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Método de Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tarjetas Guardadas */}
        {savedCards.length > 0 && (
          <div className="space-y-4">
            <Label>Tarjetas Guardadas</Label>
            {savedCards.map((card) => (
              <div
                key={card.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCard === card.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => setSelectedCard(card.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">•••• {card.last_four_digits}</p>
                    <p className="text-sm text-gray-600">
                      {card.cardholder_name} - Expira {card.expiration_month}/{card.expiration_year}
                    </p>
                  </div>
                  <input
                    type="radio"
                    checked={selectedCard === card.id}
                    onChange={() => setSelectedCard(card.id)}
                    className="text-blue-600"
                  />
                </div>
              </div>
            ))}
            
            {selectedCard && (
              <Button
                onClick={handleSavedCardPayment}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Procesando..." : "Pagar con Tarjeta Guardada"}
              </Button>
            )}

            <div className="text-center text-gray-500">o</div>
          </div>
        )}

        {/* Opción de Mercado Pago */}
        <div className="space-y-4">
          <Button
            onClick={handleMercadoPagoPayment}
            disabled={isProcessing}
            className="w-full bg-[#009ee3] hover:bg-[#0080b2]"
            size="lg"
          >
            {isProcessing ? (
              "Redirigiendo a Mercado Pago..."
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Pagar con Mercado Pago
              </>
            )}
          </Button>

          {/* Opción para guardar tarjeta */}
          {savedCards.length === 0 && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="saveCard" className="text-sm">
                <Save className="h-3 w-3 inline mr-1" />
                Guardar tarjeta para futuras compras
              </Label>
            </div>
          )}
        </div>

        {/* Información de seguridad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Pago Seguro</p>
              <p className="text-xs text-blue-700">
                Tus datos están protegidos con encriptación de grado bancario. 
                Nunca almacenamos los números completos de tu tarjeta.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}