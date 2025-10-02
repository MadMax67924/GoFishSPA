"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Package } from "lucide-react"

interface PreOrderButtonProps {
  productId: string
  productName: string
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
}

export default function PreOrderButton({ 
  productId, 
  productName,
  variant = "default",
  size = "default",
  className = ""
}: PreOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePreOrder = async () => {
    setIsLoading(true)
    
    // Mostrar confirmación al usuario
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres pre-ordenar "${productName}"?\n\n` +
      `✅ Tu producto se reservará para cuando esté disponible\n` +
      `📦 Recibirás una notificación cuando llegue el stock\n` +
      `🛒 Se agregará a tu carrito como pre-orden (color naranja)`
    )

    if (!confirmed) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          quantity: 1,
          isPreOrder: true // ← Flag para identificar pre-orden
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Error al realizar la pre-orden")
        return
      }

      toast.success(
        `¡Pre-orden realizada! ${productName} se agregó a tu carrito. Te notificaremos cuando esté disponible.`,
        { duration: 5000 }
      )

      // Actualizar carrito en tiempo real
      window.dispatchEvent(new CustomEvent("cartUpdated"))
      window.dispatchEvent(new CustomEvent("productAdded"))

    } catch (error: any) {
      console.error("Error en pre-orden:", error)
      toast.error("Error al procesar la pre-orden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePreOrder}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`bg-orange-500 hover:bg-orange-600 text-white font-bold border-2 border-orange-500 shadow-md ${className}`}
      style={{ 
        backgroundColor: '#f97316',
        borderColor: '#f97316',
        color: 'white'
      }}
    >
      {isLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          Procesando...
        </>
      ) : (
        <>
          <Package className="h-4 w-4" />
          Pre-ordenar
        </>
      )}
    </Button>
  )
}