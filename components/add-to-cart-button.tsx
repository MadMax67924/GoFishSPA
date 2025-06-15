"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [currentCartQuantity, setCurrentCartQuantity] = useState(0)
  const { toast } = useToast()

  // Obtener la cantidad actual en el carrito para este producto
  useEffect(() => {
    const fetchCurrentCartQuantity = async () => {
      try {
        const response = await fetch("/api/cart")
        if (response.ok) {
          const data = await response.json()
          const existingItem = data.items.find((item: any) => item.product_id === product.id)
          setCurrentCartQuantity(existingItem ? existingItem.quantity : 0)
        }
      } catch (error) {
        console.error("Error al obtener carrito:", error)
      }
    }

    fetchCurrentCartQuantity()
  }, [product.id])

  // Calcular el stock disponible considerando lo que ya está en el carrito
  const availableStock = product.stock - currentCartQuantity

  const incrementQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= availableStock) {
      setQuantity(value)
    }
  }

  // CU25: Añadir productos al carrito con validación de stock
  const addToCart = async () => {
    if (quantity > availableStock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo quedan ${availableStock} kg disponibles de ${product.name}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      })

      if (!response.ok) throw new Error("Error al añadir al carrito")

      // Actualizar la cantidad actual en el carrito
      setCurrentCartQuantity(currentCartQuantity + quantity)

      // Resetear la cantidad a 1
      setQuantity(1)

      toast({
        title: "Producto añadido",
        description: `${quantity} kg de ${product.name} añadidos al carrito`,
      })

      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new CustomEvent("cartUpdated"))
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto al carrito",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrementQuantity}
          disabled={quantity <= 1}
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min="1"
          max={availableStock}
          value={quantity}
          onChange={handleQuantityChange}
          className="h-10 w-20 mx-2 text-center"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={incrementQuantity}
          disabled={quantity >= availableStock}
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="ml-2 text-gray-500">kg</span>
      </div>

      {availableStock <= 0 ? (
        <div className="text-center">
          <p className="text-red-600 mb-2">Sin stock disponible</p>
          <Button disabled className="w-full h-12 text-lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Sin stock
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 text-center">
            Disponible: {availableStock} kg
            {currentCartQuantity > 0 && (
              <span className="text-blue-600"> (Ya tienes {currentCartQuantity} kg en el carrito)</span>
            )}
          </p>
          <Button
            onClick={addToCart}
            disabled={isLoading || quantity > availableStock}
            className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isLoading ? "Añadiendo..." : "Añadir al carrito"}
          </Button>
        </>
      )}
    </div>
  )
}
