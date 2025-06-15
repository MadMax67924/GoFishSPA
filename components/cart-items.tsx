"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

export default function CartItems() {
  const { items, loading, updateQuantity, removeItem, clearCart } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // CU26: Modificar cantidad en el carrito
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }

    setUpdatingItems((prev) => new Set(prev).add(itemId))

    try {
      await updateQuantity(itemId, newQuantity)
      toast({
        title: "Cantidad actualizada",
        description: "La cantidad del producto ha sido actualizada",
      })
    } catch (error) {
      console.error("Error al actualizar cantidad:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const newQuantity = Number.parseInt(value)
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      handleUpdateQuantity(itemId, newQuantity)
    }
  }

  // CU27: Eliminar producto del carrito
  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId))

    try {
      await removeItem(itemId)
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
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleClearCart = async () => {
    if (!confirm("¿Estás seguro de que quieres vaciar el carrito?")) return

    try {
      await clearCart()
      toast({
        title: "Carrito vaciado",
        description: "Todos los productos han sido eliminados del carrito",
      })
    } catch (error) {
      console.error("Error al vaciar carrito:", error)
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73]"></div>
          <span className="ml-2">Cargando carrito...</span>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Añade algunos productos para comenzar tu compra</p>
          <Link href="/productos">
            <Button className="bg-[#005f73] hover:bg-[#003d4d]">Ver productos</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Productos en tu carrito ({items.length})</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Vaciar carrito
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              {/* Imagen del producto */}
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded" />
              </div>

              {/* Información del producto */}
              <div className="flex-grow min-w-0">
                <Link
                  href={`/productos/${item.product_id}`}
                  className="font-medium text-[#005f73] hover:underline block truncate"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-600">${item.price.toLocaleString()}/kg</p>
              </div>

              {/* Controles de cantidad - CU26 */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                  disabled={updatingItems.has(item.id)}
                  className="h-8 w-16 text-center"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={updatingItems.has(item.id)}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <span className="text-sm text-gray-500 ml-1">kg</span>
              </div>

              {/* Subtotal */}
              <div className="text-right min-w-0">
                <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
              </div>

              {/* Botón eliminar - CU27 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
                disabled={updatingItems.has(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                title="Eliminar producto"
              >
                {updatingItems.has(item.id) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
