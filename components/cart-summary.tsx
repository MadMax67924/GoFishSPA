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

  const fetchCartSummary = async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Error al cargar el resumen del carrito")

      const data = await response.json()

      // Calcular el resumen
      const items = data.items || []
      const itemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0)
      const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)

      // Envío gratis por encima de cierto monto
      const shipping = subtotal > 30000 ? 0 : subtotal > 0 ? 5000 : 0

      setSummary({
        subtotal,
        shipping,
        total: subtotal + shipping,
        itemCount,
      })
    } catch (error) {
      console.error("Error:", error)
      setSummary({
        subtotal: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartSummary()

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      fetchCartSummary()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73]"></div>
          <span className="ml-2">Cargando resumen...</span>
        </CardContent>
      </Card>
    )
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
        {summary.subtotal > 0 && summary.subtotal <= 30000 && (
          <div className="text-sm text-blue-600">
            Añade ${(30000 - summary.subtotal).toLocaleString()} más para envío gratis
          </div>
        )}
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>${summary.total.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/checkout" className="w-full">
          <Button className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg" disabled={summary.itemCount === 0}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            {summary.itemCount === 0 ? "Carrito vacío" : "Proceder al pago"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
