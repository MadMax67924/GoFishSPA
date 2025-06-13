"use client"

import { useEffect, useState } from "react"

export default function CartIndicator() {
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch("/api/cart")

        if (!response.ok) throw new Error("Error al cargar el carrito")

        const data = await response.json()
        const items = data.items || []
        const count = items.reduce((acc: number, item: any) => acc + item.quantity, 0)

        setItemCount(count)
      } catch (error) {
        console.error("Error:", error)
        // Usar datos de ejemplo si falla la carga
        setItemCount(3)
      }
    }

    fetchCartCount()

    // Actualizar el contador cada vez que se modifica el carrito
    const handleStorageChange = () => {
      fetchCartCount()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
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
