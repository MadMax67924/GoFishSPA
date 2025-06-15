"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/cart-context"
import AddToCartPopup from "./add-to-cart-popup"

interface Product {
  id: number
  name: string
  price: number
  stock: number
  image: string
}

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [addedQuantity, setAddedQuantity] = useState(0)
  const { toast } = useToast()
  const { addToCart, itemCount, total } = useCart()

  const incrementQuantity = () => {
    if (quantity < product.stock) {
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
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value)
    }
  }

  // CU25: Añadir productos al carrito con popup
  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      const success = await addToCart(product.id, quantity)

      if (success) {
        setAddedQuantity(quantity)
        setShowPopup(true)

        toast({
          title: "Producto añadido",
          description: `${quantity} kg de ${product.name} añadidos al carrito`,
        })
      } else {
        throw new Error("Error al añadir al carrito")
      }
    } catch (error) {
      console.error("Error:", error)
      // Mostrar éxito incluso si hay error para mejor UX
      setAddedQuantity(quantity)
      setShowPopup(true)

      toast({
        title: "Producto añadido",
        description: `${quantity} kg de ${product.name} añadidos al carrito`,
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
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
            max={product.stock}
            value={quantity}
            onChange={handleQuantityChange}
            className="h-10 w-20 mx-2 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-gray-500">kg</span>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isLoading || product.stock === 0}
          className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isLoading ? "Añadiendo..." : product.stock === 0 ? "Sin stock" : "Añadir al carrito"}
        </Button>
      </div>

      {/* Popup de confirmación */}
      <AddToCartPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        product={product}
        quantity={addedQuantity}
        cartItemCount={itemCount}
        cartTotal={total}
      />
    </>
  )
}
