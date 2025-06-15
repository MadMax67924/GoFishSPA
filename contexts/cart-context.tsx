"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { getProductById } from "@/lib/products-data"

interface CartItem {
  id: string
  product_id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  loading: boolean
  itemCount: number
  subtotal: number
  shipping: number
  total: number
}

interface CartContextType extends CartState {
  addToCart: (productId: number, quantity: number) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems: CartItem[]

  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ITEMS":
      newItems = action.payload
      break

    case "ADD_ITEM":
      const existingItemIndex = state.items.findIndex((item) => item.product_id === action.payload.product_id)
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
        )
      } else {
        newItems = [...state.items, action.payload]
      }
      break

    case "UPDATE_ITEM":
      if (action.payload.quantity <= 0) {
        newItems = state.items.filter((item) => item.id !== action.payload.id)
      } else {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        )
      }
      break

    case "REMOVE_ITEM":
      newItems = state.items.filter((item) => item.id !== action.payload)
      break

    case "CLEAR_CART":
      newItems = []
      break

    default:
      return state
  }

  // Calcular totales
  const itemCount = newItems.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 30000 ? 0 : 5000
  const total = subtotal + shipping

  return {
    ...state,
    items: newItems,
    itemCount,
    subtotal,
    shipping,
    total,
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  })

  // Cargar carrito al inicializar
  useEffect(() => {
    refreshCart()
  }, [])

  const refreshCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: "SET_ITEMS", payload: data.items || [] })
      }
    } catch (error) {
      console.error("Error al cargar carrito:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })

      if (!response.ok) throw new Error("Error al añadir al carrito")

      // Actualizar estado local inmediatamente
      const product = getProductById(productId)
      if (product) {
        const newItem: CartItem = {
          id: `temp_${Date.now()}`,
          product_id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }
        dispatch({ type: "ADD_ITEM", payload: newItem })
      }

      return true
    } catch (error) {
      console.error("Error:", error)
      return false
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (!response.ok) throw new Error("Error al actualizar cantidad")

      // Actualizar estado local inmediatamente
      dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, quantity } })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar producto")

      // Actualizar estado local inmediatamente
      dispatch({ type: "REMOVE_ITEM", payload: itemId })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const clearCart = async () => {
    try {
      // Eliminar todos los items
      for (const item of state.items) {
        await fetch(`/api/cart?itemId=${item.id}`, { method: "DELETE" })
      }

      dispatch({ type: "CLEAR_CART" })
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
