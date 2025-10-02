"use client"

import type React from "react"
import AddToCartButton from "./add-to-cart-button"
import PreorderButton from "./preorder-button"

interface SmartProductButtonProps {
  product: {
    id: string
    name: string
    stock: number
  }
  quantity?: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
  showLabels?: boolean
  estimatedDate?: string
}

const SmartProductButton: React.FC<SmartProductButtonProps> = ({
  product,
  quantity = 1,
  variant = "default",
  size = "default",
  className = "",
  showLabels = true,
  estimatedDate = "2-3 semanas"
}) => {
  const hasStock = product.stock > 0

  if (hasStock) {
    return (
      <div className={`flex flex-col ${className}`}>
        <AddToCartButton 
          productId={product.id} 
          quantity={quantity}
          variant={variant}
          size={size}
          className="w-full"
        />
        {showLabels && (
          <span className="text-xs text-green-600 mt-1 text-center">
            ✓ En stock
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <PreorderButton 
        productId={product.id}
        productName={product.name}
        quantity={quantity}
        variant={variant}
        size={size}
        className="w-full"
        estimatedDate={estimatedDate}
      />
      {showLabels && (
        <span className="text-xs text-orange-600 mt-1 text-center">
          ⏳ Preorden disponible
        </span>
      )}
    </div>
  )
}

export default SmartProductButton