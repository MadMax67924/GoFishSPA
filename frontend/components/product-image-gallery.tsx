"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          src={images[currentImageIndex]}
          alt={`${productName} - Imagen ${currentImageIndex + 1}`}
          fill
          className="object-cover rounded-lg"
          priority
        />

        {/* CU20: Botón para ver en alta calidad */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Expandir
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative w-full h-[80vh]">
              <Image
                src={images[currentImageIndex]}
                alt={`${productName} - Imagen en alta calidad`}
                fill
                className="object-contain"
                quality={100}
              />

              {/* Controles en modal */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`relative h-16 w-16 flex-shrink-0 rounded border-2 overflow-hidden ${
                index === currentImageIndex ? "border-[#2a9d8f]" : "border-gray-300"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
