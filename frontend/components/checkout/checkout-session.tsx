"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, Shield, CreditCard, CheckCircle, Package } from "lucide-react"

//Primero saca los datos necesarios de /orders/[id], despues crea una checkout session llamando a /payment-intent
//De ahi muestra el resmune de checkout y si se aprieta en el boton de pagar se redirige al checkout session
//el cual maneja el pago por si mismo
export default function StripeCheckoutSession() {
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [checkoutData, setCheckoutData] = useState<{
    checkoutUrl: string
    orderData: any
  } | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const orderId = searchParams.get("orderId")
        
        if (!orderId) {
          throw new Error("No se encontró el ID del pedido")
        }

        const orderRes = await fetch(`/api/orders/${orderId}`)
        if (!orderRes.ok) {
          throw new Error("Error al cargar los datos del pedido")
        }

        const orderDataFromDB = await orderRes.json()

        const checkoutRes = await fetch("/api/payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: orderDataFromDB.total,
            cartItems: orderDataFromDB.items || [],
            orderId: orderId
          }),
        })

        if (!checkoutRes.ok) {
          const errorData = await checkoutRes.json()
          throw new Error(errorData.error || "Error al crear la sesión de pago")
        }

        const checkoutData = await checkoutRes.json()
        
        if (!checkoutData.checkoutUrl) {
          throw new Error("No se recibió la URL de checkout")
        }

        setCheckoutData({
          checkoutUrl: checkoutData.checkoutUrl,
          orderData: orderDataFromDB
        })

      } catch (error: any) {
        console.error("Error inicializando checkout:", error)
        setError(error.message || "Error al inicializar el proceso de pago")
      } finally {
        setLoading(false)
      }
    }

    initializeCheckout()
  }, [searchParams, router])

  const handleRedirectToCheckout = () => {
    setRedirecting(true)
    window.location.href = checkoutData!.checkoutUrl
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#005f73]" />
            <p className="text-lg font-semibold">Preparando tu checkout seguro</p>
            <p className="text-gray-600 mt-2">Estamos configurando todo para que tu pago sea rápido y seguro</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p className="font-semibold text-lg">Error en el proceso de pago</p>
            <p className="mt-2">{error}</p>
            <Button 
              onClick={() => router.push("/checkout")} 
              className="mt-4"
            >
              Volver al Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!checkoutData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>No se pudo inicializar el proceso de pago</p>
            <Button 
              onClick={() => router.push("/checkout")} 
              className="mt-4"
            >
              Volver al Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          Checkout Seguro - GoFish SpA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Resumen de tu pedido</h3>
          <div className="space-y-2">
            <p><strong>Cliente:</strong> {checkoutData.orderData.first_name} {checkoutData.orderData.last_name}</p>
            <p><strong>Email:</strong> {checkoutData.orderData.email}</p>
            <p><strong>Teléfono:</strong> {checkoutData.orderData.phone}</p>
            <p><strong>Dirección:</strong> {checkoutData.orderData.address}, {checkoutData.orderData.city}</p>
            
            {checkoutData.orderData.items && checkoutData.orderData.items.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold">Productos:</p>
                <ul className="text-sm mt-1 space-y-1">
                  {checkoutData.orderData.items.map((item: any, index: number) => (
                    <li key={index}>
                      {item.name} - {item.quantity} kg - ${(item.price * item.quantity).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="border-t pt-2 mt-2">
              <p className="text-lg font-bold">
                Total: ${checkoutData.orderData.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleRedirectToCheckout}
            className="w-full bg-[#005f73] hover:bg-[#003d4d] h-14 text-lg font-semibold"
            disabled={redirecting}
            size="lg"
          >
            {redirecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Redirigiendo al checkout seguro...
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5 mr-2" />
                Proceder al Pago - ${checkoutData.orderData.total.toLocaleString()}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/checkout")}
            disabled={redirecting}
            className="w-full"
          >
            Volver al checkout
          </Button>
        </div>

        <div className="text-center pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
            <Shield className="h-4 w-4" />
            <span>Protegido por Stripe • SSL Encriptado • PCI DSS Compliant</span>
          </div>
          <p className="text-xs text-gray-400">
            Serás redirigido al checkout seguro de Stripe para completar tu pago
          </p>
        </div>
      </CardContent>
    </Card>
  )
}