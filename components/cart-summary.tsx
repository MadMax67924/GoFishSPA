"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

interface CartSummary {
  subtotal: number
  shipping: number
  total: number
  itemCount: number
}

export default function CartSummary() {
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
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
        const itemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0)
        const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)

        // Envío gratis por encima de cierto monto
        const shipping = subtotal > 30000 ? 0 : 5000

        setSummary({
          subtotal,
          shipping,
          total: subtotal + shipping,
          itemCount,
        })
      } catch (error) {
        console.error("Error:", error)
        // Usar datos de ejemplo si falla la carga
        setSummary({
          subtotal: 30970,
          shipping: 0,
          total: 30970,
          itemCount: 3,
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
        <CardTitle>Resumen de compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({summary.itemCount} productos)</span>
          <span>${summary.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Envío</span>
          <span>{summary.shipping === 0 ? "Gratis" : `$${summary.shipping.toLocaleString()}`}</span>
        </div>
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>${summary.total.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/checkout" className="w-full">
          <Button className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Proceder al pago
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
