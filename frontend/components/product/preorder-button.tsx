"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

interface PreorderButtonProps {
  productId: string
  productName: string
  quantity?: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
  estimatedDate?: string
}

const PreorderButton: React.FC<PreorderButtonProps> = ({ 
  productId, 
  productName,
  quantity = 1,
  variant = "default",
  size = "default",
  className = "",
  estimatedDate = "2-3 semanas"
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handlePreorder = async () => {
    setIsLoading(true)
    try {
      console.log("Creando preorden:", { productId, productName, quantity })

      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          productName: productName,
          quantity: quantity,
          estimatedDate: estimatedDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error response:", data)
        toast.error(data.error || "Error al crear la preorden.")
        return
      }

      toast.success(`¡Preorden creada! Te notificaremos cuando ${productName} esté disponible.`)
      window.dispatchEvent(new CustomEvent("preorderCreated"))

    } catch (error: any) {
      console.error("Error creating preorder:", error)
      toast.error(error.message || "Algo salió mal al crear la preorden.")
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "font-bold rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
    
    const variants = {
      default: "bg-orange-500 hover:bg-orange-700 text-white",
      outline: "border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white",
      secondary: "bg-amber-500 hover:bg-amber-700 text-white"
    }

    const sizes = {
      default: "py-3 px-6",
      sm: "py-2 px-4 text-sm",
      lg: "py-4 px-8 text-lg"
    }

    return `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
  }

  return (
    <button
      onClick={handlePreorder}
      disabled={isLoading}
      className={getButtonStyles()}
      aria-label={`Preordenar ${productName}`}
      title={`Disponible en ${estimatedDate}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Preordenar ahora
        </span>
      )}
    </button>
  )
}

export default PreorderButton