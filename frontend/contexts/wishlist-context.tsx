"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  addToWishlist: (product: WishlistItem) => void
  removeFromWishlist: (productId: number) => void
  clearWishlist: () => void
  isInWishlist: (productId: number) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_STORAGE_KEY = 'gofish-wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Indicar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar wishlist desde localStorage al inicializar
  useEffect(() => {
    if (isClient) {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
        if (stored) {
          setItems(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error)
      }
    }
  }, [isClient])

  // Guardar en localStorage cada vez que cambie la lista
  useEffect(() => {
    if (isClient && items.length >= 0) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Error saving wishlist to localStorage:", error)
      }
    }
  }, [items, isClient])

  const itemCount = items.length

  // Añadir a favoritos
  const addToWishlist = useCallback((product: WishlistItem) => {
    setItems(prevItems => {
      // Verificar si ya existe
      const exists = prevItems.some(item => item.id === product.id)
      if (exists) {
        return prevItems // No añadir duplicados
      }
      const newItems = [...prevItems, product]
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new CustomEvent("wishlistUpdated"))
      return newItems
    })
  }, [])

  // Eliminar de favoritos
  const removeFromWishlist = useCallback((productId: number) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId)
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new CustomEvent("wishlistUpdated"))
      return newItems
    })
  }, [])

  // Limpiar lista de deseos
  const clearWishlist = useCallback(() => {
    setItems([])
    // Disparar evento personalizado para actualizar otros componentes
    window.dispatchEvent(new CustomEvent("wishlistUpdated"))
  }, [])

  // Verificar si un producto está en favoritos
  const isInWishlist = useCallback((productId: number) => {
    return items.some(item => item.id === productId)
  }, [items])

  const value: WishlistContextType = {
    items,
    itemCount,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}