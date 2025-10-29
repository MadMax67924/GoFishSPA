"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
<<<<<<< Updated upstream
import { Button } from "@/components/ui";
import { CheckCircle } from "lucide-react"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get("order")
    const sessionId = searchParams.get("session_id")
    const paymentSuccess = searchParams.get("payment") === "success"

    const verifyPayment = async () => {
      try {
        if (orderId && (paymentSuccess || sessionId)) {
          // Actualizar el estado del pedido a "confirmed"
          const updateResponse = await fetch("/api/orders/update-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: orderId,
              status: "confirmed"
            }),
          })

          if (updateResponse.ok) {
            const data = await updateResponse.json()
            setOrderNumber(data.orderNumber || `GF-${orderId}`)
          }
        }
      } catch (error) {
        console.error("Error verificando pago:", error)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-center py-12">
                <p>Verificando tu pago...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }
=======
import { Button } from "@/components/ui/button"; // Cambiado de "@/components/ui"

import { CheckCircle } from "lucide-react"

export const metadata = {
  title: "Pedido Confirmado | GoFish SpA",
  description: "Tu pedido ha sido confirmado con éxito",
}

interface PageProps {
  searchParams: {
    order?: string
  }
}

export default function OrderConfirmationPage({ searchParams }: PageProps) {
  const orderNumber = searchParams.order || `GF-${Math.floor(100000 + Math.random() * 900000)}`
>>>>>>> Stashed changes

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-[#005f73]">¡Pedido Confirmado!</h1>

            <p className="text-lg mb-6">Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Detalles del pedido</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-gray-600">Número de pedido:</p>
<<<<<<< Updated upstream
                  <p className="font-medium">{orderNumber || `GF-${Math.floor(100000 + Math.random() * 900000)}`}</p>
=======
                  <p className="font-medium">{orderNumber}</p>
>>>>>>> Stashed changes
                </div>
                <div>
                  <p className="text-gray-600">Fecha:</p>
                  <p className="font-medium">{new Date().toLocaleDateString('es-CL')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estado:</p>
                  <p className="font-medium text-green-600">Confirmado</p>
                </div>
                <div>
                  <p className="text-gray-600">Método de pago:</p>
                  <p className="font-medium">WebPay (Stripe)</p>
                </div>
              </div>
            </div>

            <p className="mb-8">
              Te hemos enviado un correo electrónico con los detalles de tu compra. 
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button className="bg-[#005f73] hover:bg-[#003d4d]">Volver al inicio</Button>
              </Link>
              <Link href="/productos">
                <Button variant="outline">Seguir comprando</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}