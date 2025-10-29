"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WishlistItem {
  id: number
  name: string
  price: number
  image?: string        // ← Para que funcione product.image
  description?: string  // ← Para que funcione product.description
  category?: string     // ← Para que funcione product.category
  stock?: number        // ← Para que funcione product.stock
  product_id?: number   // Solo para items de DB
  user_id?: number      // Solo para items de DB
  created_at?: string   // Solo para items de DB
}

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  addToWishlist: (product: any) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  clearWishlist: () => Promise<void> // ← AÑADIR ESTA LÍNEA
  isInWishlist: (productId: number) => boolean
  loading: boolean
  error: string | null
  isLoggedIn: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Verificar si el usuario está logueado
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Cargar wishlist cuando cambia el estado de auth
  useEffect(() => {
    if (isLoggedIn) {
      loadWishlistFromDB()
    } else {
      loadWishlistFromLocalStorage()
    }
  }, [isLoggedIn])

  const checkAuthStatus = () => {
    // TODO: Implementar verificación real de autenticación
    // Por ahora, simular con localStorage o JWT
    const token = localStorage.getItem('authToken')
    setIsLoggedIn(!!token)
  }

  // CARGAR desde LocalStorage (usuario no logueado)
  const loadWishlistFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('gofish-wishlist')
      const parsedItems = stored ? JSON.parse(stored) : []
      setItems(parsedItems)
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      setItems([])
    }
  }

  // CARGAR desde Base de Datos (usuario logueado)
  const loadWishlistFromDB = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wishlist')
      
      if (!response.ok) {
        throw new Error('Error al cargar lista de deseos')
      }
      
      const data = await response.json()
      setItems(data.wishlist || [])
    } catch (err) {
      console.error('Error loading wishlist from DB:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // MIGRAR LocalStorage → Base de Datos (cuando el usuario se loguea)
  const migrateLocalStorageToDB = async () => {
    try {
      const localItems = localStorage.getItem('gofish-wishlist')
      if (!localItems) return

      const parsedItems = JSON.parse(localItems)
      
      // Enviar cada item a la base de datos
      for (const item of parsedItems) {
        try {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: item.id }),
          })
        } catch (error) {
          console.error('Error migrating item:', item.id, error)
        }
      }
      
      // Limpiar localStorage después de migrar
      localStorage.removeItem('gofish-wishlist')
      
      // Recargar desde DB
      await loadWishlistFromDB()
    } catch (error) {
      console.error('Error migrating to DB:', error)
    }
  }

  const addToWishlist = async (product: any) => {
    try {
      setLoading(true)
      setError(null)

      if (isLoggedIn) {
        // USUARIO LOGUEADO: Guardar en base de datos
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        })
        
        if (!response.ok) {
          throw new Error('Error al agregar producto')
        }
        
        await loadWishlistFromDB()
      } else {
        // USUARIO NO LOGUEADO: Guardar en localStorage
        const newItem: WishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        }
        
        const updatedItems = [...items, newItem]
        setItems(updatedItems)
        localStorage.setItem('gofish-wishlist', JSON.stringify(updatedItems))
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      setError(err instanceof Error ? err.message : 'Error al agregar producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      setLoading(true)
      setError(null)

      if (isLoggedIn) {
        // USUARIO LOGUEADO: Eliminar de base de datos
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Error al eliminar producto')
        }
        
        setItems(prevItems => prevItems.filter(item => 
          (item.product_id || item.id) !== productId
        ))
      } else {
        // USUARIO NO LOGUEADO: Eliminar de localStorage
        const updatedItems = items.filter(item => item.id !== productId)
        setItems(updatedItems)
        localStorage.setItem('gofish-wishlist', JSON.stringify(updatedItems))
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar producto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearWishlist = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isLoggedIn) {
        // Usuario logueado: Limpiar base de datos
        const response = await fetch('/api/wishlist/clear', {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Error al limpiar lista de deseos')
        }
      } else {
        // Usuario no logueado: Limpiar localStorage
        localStorage.removeItem('gofish-wishlist')
      }
      
      // Limpiar estado local
      setItems([])
    } catch (err) {
      console.error('Error clearing wishlist:', err)
      setError(err instanceof Error ? err.message : 'Error al limpiar lista')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const isInWishlist = (productId: number): boolean => {
    if (isLoggedIn) {
      return items.some(item => (item.product_id || item.id) === productId)
    } else {
      return items.some(item => item.id === productId)
    }
  }

  // Función para llamar cuando el usuario se loguea
  const onUserLogin = async () => {
    setIsLoggedIn(true)
    await migrateLocalStorageToDB()
  }

  // Función para llamar cuando el usuario se desloguea
  const onUserLogout = () => {
    setIsLoggedIn(false)
    setItems([])
    loadWishlistFromLocalStorage()
  }

  const value: WishlistContextType = {
    items,
    itemCount: items.length,
    addToWishlist,
    removeFromWishlist,
    clearWishlist, // ← AÑADIR ESTA LÍNEA
    isInWishlist,
    loading,
    error,
    isLoggedIn
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist debe ser usado dentro de un WishlistProvider')
  }
  return context
}

// Exportar funciones para manejar auth