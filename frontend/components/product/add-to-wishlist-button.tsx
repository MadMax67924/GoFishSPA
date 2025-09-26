"use client"

import type React from "react"
import { useState } from "react"
import { Heart, HeartIcon } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

interface AddToWishlistButtonProps {
  product: Product
  className?: string
}

const AddToWishlistButton: React.FC<AddToWishlistButtonProps> = ({ 
  product, 
  className = "" 
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  
  const inWishlist = isInWishlist(product.id)

  const handleToggleWishlist = async () => {
    setIsLoading(true)
    try {
      if (inWishlist) {
        removeFromWishlist(product.id)
        toast.success("Producto removido de Lista de Deseos")
      } else {
        addToWishlist(product)
        toast.success("Producto agregado a Lista de Deseos")
      }
    } catch (error) {
      toast.error("Error al actualizar Lista de Deseos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
        ${inWishlist 
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-red-500"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={inWishlist ? "Remover de Lista de Deseos" : "Agregar a Lista de Deseos"}
    >
      {inWishlist ? (
        <Heart className="w-5 h-5 fill-current" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">
        {isLoading ? "..." : (inWishlist ? "En Lista de Deseos" : "Agregar a Lista de Deseos")}
      </span>
    </button>
  )
}

export default AddToWishlistButton