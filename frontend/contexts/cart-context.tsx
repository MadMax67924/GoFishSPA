"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface CartItem {
  id: string
  product_id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  loading: boolean
  addToCart: (productId: number, quantity: number) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Calcular valores derivados
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 30000 ? 0 : 5000
  const total = subtotal + shipping

  // Función para refrescar el carrito
  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error("Error refreshing cart:", error)
    }
  }, [])

  // Cargar carrito inicial
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)
      await refreshCart()
      setLoading(false)
    }
    loadCart()
  }, [refreshCart])

  // Añadir al carrito
  const addToCart = useCallback(
    async (productId: number, quantity: number): Promise<boolean> => {
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        })

        if (response.ok) {
          await refreshCart()
          return true
        }
        return false
      } catch (error) {
        console.error("Error adding to cart:", error)
        return false
      }
    },
    [refreshCart],
  )

  // Actualizar cantidad
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity }),
        })

        if (response.ok) {
          await refreshCart()
        }
      } catch (error) {
        console.error("Error updating quantity:", error)
      }
    },
    [refreshCart],
  )

  // Eliminar item
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        const response = await fetch(`/api/cart?itemId=${itemId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          await refreshCart()
        }
      } catch (error) {
        console.error("Error removing item:", error)
      }
    },
    [refreshCart],
  )

  // Limpiar carrito
  const clearCart = useCallback(async () => {
    try {
      // Eliminar todos los items
      for (const item of items) {
        await fetch(`/api/cart?itemId=${item.id}`, {
          method: "DELETE",
        })
      }
      await refreshCart()
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }, [items, refreshCart])

  const value: CartContextType = {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
