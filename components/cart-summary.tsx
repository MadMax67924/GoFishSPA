"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export default function CartSummary() {
  const { itemCount, subtotal, shipping, total, loading } = useCart()

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
          <span className="text-gray-600">Subtotal ({itemCount} productos)</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Envío</span>
          <span>{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString()}`}</span>
        </div>
        {subtotal > 30000 && (
          <div className="text-sm text-green-600 font-medium">¡Envío gratis por compras superiores a $30.000!</div>
        )}
        <div className="border-t pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/checkout" className="w-full">
          <Button className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg" disabled={itemCount === 0}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Proceder al pago
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
