"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

interface AddToCartButtonProps {
  productId: string
  quantity?: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  productId, 
  quantity = 1,
  variant = "default",
  size = "default",
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      console.log("Añadiendo al carrito:", { productId, quantity })

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error response:", data)
        toast.error(data.error || "Failed to add to cart.")
        return
      }

      toast.success("Producto añadido al carrito!")

      // Disparar eventos para actualizar el carrito en tiempo real
      window.dispatchEvent(new CustomEvent("cartUpdated"))
      window.dispatchEvent(new CustomEvent("productAdded"))

      // Opcional: Actualizar localStorage para consistencia inmediata
      try {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")
        const existingItemIndex = currentCart.findIndex((item: any) => item.productId === productId)

        if (existingItemIndex > -1) {
          currentCart[existingItemIndex].quantity += quantity
        } else {
          currentCart.push({ productId, quantity })
        }

        localStorage.setItem("cart", JSON.stringify(currentCart))
      } catch (localStorageError) {
        console.warn("No se pudo actualizar localStorage:", localStorageError)
      }

      console.log("Producto añadido exitosamente")

    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast.error(error.message || "Algo salió mal al añadir al carrito.")
    } finally {
      setIsLoading(false)
    }
  }

  // Estilos basados en variant y size
  const getButtonStyles = () => {
    const baseStyles = "font-bold rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      default: "bg-blue-500 hover:bg-blue-700 text-white",
      outline: "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
      secondary: "bg-gray-500 hover:bg-gray-700 text-white"
    }

    const sizes = {
      default: "py-2 px-4",
      sm: "py-1 px-2 text-sm",
      lg: "py-3 px-6 text-lg"
    }

    return `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={getButtonStyles()}
      aria-label={`Añadir producto al carrito`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Añadiendo...
        </span>
      ) : (
        "Añadir al carrito"
      )}
    </button>
  )
}

export default AddToCartButton