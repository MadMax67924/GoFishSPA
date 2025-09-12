"use client"

import { useEffect, useState } from "react"

export default function CartIndicator() {
  const [itemCount, setItemCount] = useState(0)

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) throw new Error("Error al cargar el carrito")

      const data = await response.json()
      const items = data.items || []
      const count = items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)

      console.log(`CartIndicator: ${items.length} items, ${count} total quantity`)
      setItemCount(count)
    } catch (error) {
      console.error("Error:", error)
      setItemCount(0)
    }
  }

  useEffect(() => {
    fetchCartCount()

    // Actualizar el contador cada vez que se modifica el carrito
    const handleCartUpdate = () => {
      setTimeout(() => {
        fetchCartCount()
      }, 100)
    }

    const handleCartCleared = () => {
      console.log("Carrito limpiado - reseteando contador")
      setItemCount(0)
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

  if (itemCount === 0) {
    return null
  }

  return (
    <span className="absolute -top-2 -right-2 bg-[#e9c46a] text-[#005f73] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {itemCount > 9 ? "9+" : itemCount}
    </span>
  )
}
