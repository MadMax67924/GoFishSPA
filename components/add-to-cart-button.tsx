"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"

interface AddToCartButtonProps {
  productId: string
  quantity?: number
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, quantity = 1 }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to add to cart.")
        return
      }

      const data = await response.json()
      toast.success("Product added to cart!")

      // Disparar evento para actualizar el carrito en tiempo real
      window.dispatchEvent(new CustomEvent("cartUpdated"))

      // También disparar evento específico para productos añadidos
      window.dispatchEvent(new CustomEvent("productAdded"))

      // Update local cart state (example - replace with your actual logic)
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingItemIndex = currentCart.findIndex((item: any) => item.productId === productId)

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity
      } else {
        currentCart.push({ productId, quantity })
      }

      localStorage.setItem("cart", JSON.stringify(currentCart))

      // Disparar evento para actualizar el carrito en tiempo real
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {isLoading ? "Adding..." : "Add to Cart"}
    </button>
  )
}

export default AddToCartButton
