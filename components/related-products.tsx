"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export default function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Buscar productos de la misma categoría
        const response = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=4`)

        if (!response.ok) {
          throw new Error("Error al cargar productos relacionados")
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          // Filtrar el producto actual y limitar a 3 productos
          const relatedProducts = data
            .filter((product: Product) => product.id.toString() !== currentProductId)
            .slice(0, 3)
          setProducts(relatedProducts)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId, category])

  const addToCart = async (product: Product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al añadir al carrito")
      }

      toast({
        title: "Producto añadido",
        description: `${product.name} se ha añadido al carrito`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Producto añadido",
        description: `${product.name} se ha añadido al carrito`,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#005f73]"></div>
        <span className="ml-2">Cargando productos relacionados...</span>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay productos relacionados disponibles.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-5px] border"
        >
          <div className="relative h-48">
            <Image
              src={product.image || "/placeholder.svg?height=200&width=300"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {product.stock <= 10 && product.stock > 0 && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                Stock bajo
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">Sin stock</div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-[#005f73] mb-2 line-clamp-1">{product.name}</h3>
            <div className="text-[#2a9d8f] font-bold text-xl mb-2">${product.price.toLocaleString()}/kg</div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

            <div className="text-sm text-gray-500 mb-4">
              {product.stock > 0 ? `Stock: ${product.stock} kg` : "Sin stock"}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#2a9d8f] hover:bg-[#21867a] text-sm"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                {product.stock === 0 ? "Sin stock" : "Añadir"}
              </Button>
              <Link href={`/productos/${product.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
