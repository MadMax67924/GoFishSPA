"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ShoppingCart, X } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  image: string
}

interface AddToCartPopupProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  quantity: number
  cartItemCount: number
  cartTotal: number
}

export default function AddToCartPopup({
  isOpen,
  onClose,
  product,
  quantity,
  cartItemCount,
  cartTotal,
}: AddToCartPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Auto cerrar después de 5 segundos
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Esperar a que termine la animación
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <Card
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <CardContent className="p-6">
          {/* Botón cerrar */}
          <Button variant="ghost" size="icon" onClick={handleClose} className="absolute top-2 right-2 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>

          {/* Icono de éxito */}
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-center mb-4">¡Producto añadido al carrito!</h3>

          {/* Información del producto */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="relative h-12 w-12 flex-shrink-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-sm text-gray-600">
                {quantity} kg × ${product.price.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${(product.price * quantity).toLocaleString()}</p>
            </div>
          </div>

          {/* Resumen del carrito */}
          <div className="bg-[#005f73] text-white p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Carrito ({cartItemCount} productos)</span>
              <span className="font-semibold">${cartTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Seguir comprando
            </Button>
            <Link href="/carrito" className="flex-1">
              <Button className="w-full bg-[#005f73] hover:bg-[#003d4d]">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver carrito
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
