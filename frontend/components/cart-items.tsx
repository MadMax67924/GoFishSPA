"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CartItem {
  id: string
  product_id: number
  name: string
  price: number
  image: string
  quantity: number
}

export default function CartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      })

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

  useEffect(() => {
    fetchCart()

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      setTimeout(() => {
        fetchCart()
      }, 100)
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("productAdded", handleCartUpdate)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("productAdded", handleCartUpdate)
    }
  }, [])

  // CU26: Modificar cantidad en el carrito
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }

    setUpdatingItems((prev) => new Set(prev).add(itemId))

    // Actualización optimista del estado local PRIMERO
    setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      if (!response.ok) {
        // Si falla, revertir el cambio optimista
        await fetchCart()
        throw new Error("Error al actualizar cantidad")
      }

      toast({
        title: "Cantidad actualizada",
        description: "La cantidad del producto ha sido actualizada",
      })

      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new CustomEvent("cartUpdated"))
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
      updateQuantity(itemId, newQuantity)
    }
  }

  // CU27: Eliminar producto del carrito
  const removeItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId))

    // Actualización optimista del estado local PRIMERO
    setCartItems(cartItems.filter((item) => item.id !== itemId))

    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        // Si falla, recargar desde la API
        await fetchCart()
        throw new Error("Error al eliminar producto")
      }

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del carrito",
      })

      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new CustomEvent("cartUpdated"))
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

  const clearCart = async () => {
    if (!confirm("¿Estás seguro de que quieres vaciar el carrito?")) return

    try {
      // Actualizar estado local PRIMERO para feedback inmediato
      setCartItems([])

      // Usar el endpoint específico para limpiar completamente
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al vaciar carrito")
      }

      const result = await response.json()
      console.log("Carrito limpiado:", result)

      // Disparar múltiples eventos para asegurar sincronización completa
      window.dispatchEvent(new CustomEvent("cartCleared"))
      window.dispatchEvent(new CustomEvent("cartUpdated"))

      // Forzar actualización después de un pequeño delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("cartUpdated"))
      }, 100)

      toast({
        title: "Carrito vaciado",
        description: "Todos los productos han sido eliminados del carrito",
      })
    } catch (error) {
      console.error("Error al vaciar carrito:", error)
      // Si hay error, recargar desde la API
      await fetchCart()
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito completamente",
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

  if (cartItems.length === 0) {
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
        <CardTitle>Productos en tu carrito ({cartItems.length})</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Vaciar carrito
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cartItems.map((item) => (
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
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                onClick={() => removeItem(item.id)}
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
