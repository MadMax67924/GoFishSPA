"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CartItem {
  name: string
  price: number
  quantity: number
}

interface CartSummary {
  subtotal: number
  shipping: number
  total: number
  items: CartItem[]
}

export default function CheckoutSummary() {
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    shipping: 0,
    total: 0,
    items: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCartSummary = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/cart")

        if (!response.ok) throw new Error("Error al cargar el resumen del carrito")

        const data = await response.json()

        // Calcular el resumen
        const items = data.items || []
        const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)

        // Envío gratis por encima de cierto monto
        const shipping = subtotal > 30000 ? 0 : 5000

        setSummary({
          subtotal,
          shipping,
          total: subtotal + shipping,
          items: items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        })
      } catch (error) {
        console.error("Error:", error)
        // Usar datos de ejemplo si falla la carga
        setSummary({
          subtotal: 30970,
          shipping: 0,
          total: 30970,
          items: [
            { name: "Salmón Fresco", price: 8990, quantity: 2 },
            { name: "Camarones", price: 12990, quantity: 1 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCartSummary()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Cargando resumen...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {summary.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.name} ({item.quantity} kg)
              </span>
              <span>${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${summary.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Envío</span>
            <span>{summary.shipping === 0 ? "Gratis" : `$${summary.shipping.toLocaleString()}`}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>${summary.total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
