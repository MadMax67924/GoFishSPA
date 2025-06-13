"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  id: number
  product_id: number
  name: string
  price: number
  image: string
  quantity: number
}

export default function CartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/cart")

        if (!response.ok) throw new Error("Error al cargar el carrito")

        const data = await response.json()
        setCartItems(data.items || [])
      } catch (error) {
        console.error("Error:", error)
        setCartItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (!response.ok) throw new Error("Error al actualizar cantidad")

      setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))

      toast({
        title: "Carrito actualizado",
        description: "La cantidad ha sido actualizada",
      })
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar producto")

      setCartItems(cartItems.filter((item) => item.id !== itemId))

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del carrito",
      })
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-12">Cargando carrito...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-6">Añade algunos productos para comenzar tu compra</p>
        <Link href="/productos">
          <Button className="bg-[#005f73] hover:bg-[#003d4d]">Ver productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left pb-4">Producto</th>
              <th className="text-center pb-4">Cantidad</th>
              <th className="text-right pb-4">Precio</th>
              <th className="text-right pb-4">Subtotal</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cartItems.map((item) => (
              <tr key={item.id} className="py-4">
                <td className="py-4">
                  <div className="flex items-center">
                    <div className="relative h-16 w-16 mr-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <Link href={`/productos/${item.product_id}`} className="hover:text-[#005f73] hover:underline">
                      {item.name}
                    </Link>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                      className="h-8 w-16 mx-2 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="ml-1 text-gray-500">kg</span>
                  </div>
                </td>
                <td className="py-4 text-right">${item.price.toLocaleString()}/kg</td>
                <td className="py-4 text-right font-medium">${(item.price * item.quantity).toLocaleString()}</td>
                <td className="py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
