"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui";
import { CheckCircle, Download } from "lucide-react"

interface OrderDetails {
  id: number
  order_number: string
  total: number
  status: string
  invoice_pdf_path: string | null
  created_at: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const orderId = searchParams.get("order")
    const sessionId = searchParams.get("session_id")

    const fetchOrderDetails = async () => {
      try {
        if (orderId) {
          console.log("🔄 Obteniendo detalles de la orden:", orderId)
          
          // Obtener los detalles actuales de la orden
          const response = await fetch(`/api/orders/${orderId}`)
          if (response.ok) {
            const orderData = await response.json()
            setOrder(orderData)
            console.log("📊 Datos de la orden:", orderData)
          } else {
            console.error("Error obteniendo detalles de la orden")
          }
        }
      } catch (error) {
        console.error("Error verificando pedido:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [searchParams])

  const downloadInvoice = async () => {
    if (!order?.invoice_pdf_path) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/invoices/${order.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `factura-${order.order_number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error("Error al descargar")
      }
    } catch (error) {
      console.error("Error descargando factura:", error)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005f73] mx-auto"></div>
                <p className="mt-4">Verificando tu pago...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

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
                  <p className="font-medium">{order?.order_number || `GF-${searchParams.get("order")}`}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha:</p>
                  <p className="font-medium">{order?.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estado:</p>
                  <p className="font-medium text-green-600 capitalize">{order?.status || "Confirmado"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Método de pago:</p>
                  <p className="font-medium">WebPay (Stripe)</p>
                </div>
                {order?.total && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Total:</p>
                    <p className="font-medium text-lg">${order.total.toLocaleString('es-CL')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN DE DESCARGA DE FACTURA */}
            {order?.invoice_pdf_path && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-800">Factura Disponible</h3>
                <p className="text-green-700 mb-4">
                  Tu factura PDF está lista para descargar. Guárdala para tus registros.
                </p>
                <Button 
                  onClick={downloadInvoice}
                  disabled={downloading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Factura PDF
                    </>
                  )}
                </Button>
              </div>
            )}

            {!order?.invoice_pdf_path && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                <p className="text-blue-700">
                  Tu factura se generará automáticamente en unos momentos. 
                  {order && " Puedes recargar esta página para verla."}
                </p>
              </div>
            )}

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
              {order && (
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Actualizar Estado
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}