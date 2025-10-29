"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const fetchCartSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) throw new Error("Error al cargar el resumen del carrito")

      const data = await response.json()
      const items = data.items || []

      const validItems = items.filter(
        (item: any) =>
          item &&
          typeof item.quantity === "number" &&
          typeof item.price === "number" &&
          item.quantity > 0 &&
          item.price > 0,
      )

      const itemCount = validItems.reduce((acc: number, item: any) => {
        return acc + item.quantity
      }, 0)

      const subtotal = validItems.reduce((acc: number, item: any) => {
        return acc + item.price * item.quantity
      }, 0)

      let shipping = 0
      if (itemCount > 0) {
        shipping = subtotal >= 30000 ? 0 : 5000
      }

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

    const handleCartUpdate = () => {
      setTimeout(() => {
        console.log("Actualizando resumen del carrito...")
        fetchCartSummary()
      }, 150)
    }

    const handleCartCleared = () => {
      console.log("Carrito limpiado - reseteando summary")
      setSummary({
        subtotal: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
      })
      setLoading(false)
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("productAdded", handleCartUpdate)
    window.addEventListener("cartCleared", handleCartCleared)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("productAdded", handleCartUpdate)
      window.removeEventListener("cartCleared", handleCartCleared)
    }
  }, [])

  // Función para manejar compra recurrente
  const handleRecurringOrder = async () => {
    try {
      // Verificar si el usuario está autenticado
      const authCheck = await fetch("/api/auth/check");
      if (!authCheck.ok) {
        router.push("/login");
        return;
      }

      // Redirigir a página de órdenes recurrentes
      router.push("/recurring-orders");
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    }
  }

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
        {summary.itemCount > 0 && summary.subtotal < 30000 && (
          <div className="text-sm text-blue-600">
            Añade ${(30000 - summary.subtotal).toLocaleString()} más para envío gratis
          </div>
        )}
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>${summary.total.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Link href="/checkout" className="w-full">
          <Button className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg" disabled={summary.itemCount === 0}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            {summary.itemCount === 0 ? "Carrito vacío" : "Proceder al pago"}
          </Button>
        </Link>
        
        {/* BOTÓN DE COMPRA RECURRENTE EN EL RESUMEN */}
        <Button
          onClick={handleRecurringOrder}
          variant="outline"
          className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Compra Recurrente
        </Button>
      </CardFooter>
    </Card>
  )
}