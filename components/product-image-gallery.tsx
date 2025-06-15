"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  showPhotoButton?: boolean
}

export default function ProductImageGallery({
  images,
  productName,
  showPhotoButton = false,
}: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative h-80 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Sin imagen disponible</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative h-80 md:h-96 group">
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={`${productName} - Imagen ${currentImageIndex + 1}`}
          fill
          className="object-cover rounded-lg"
          priority
          onError={(e) => {
            console.log(`Error loading image: ${images[currentImageIndex]}`)
            e.currentTarget.src = "/placeholder.svg?height=400&width=400"
          }}
        />

        {/* Navigation controls - only show if multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image counter - only show if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails - only show if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`relative h-16 w-16 flex-shrink-0 rounded border-2 overflow-hidden transition-colors ${
                index === currentImageIndex ? "border-[#2a9d8f]" : "border-gray-300 hover:border-gray-400"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
