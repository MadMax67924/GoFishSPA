"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye, RefreshCw, Heart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWishlist } from "@/contexts/wishlist-context"
import PreOrderButton from "./pre-order-button" // ← NUEVA IMPORTACIÓN

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Memoizar los parámetros para evitar recargas innecesarias
  const query = searchParams.get("q") || ""
  const categories = searchParams.getAll("category").join(",")
  const minPrice = searchParams.get("minPrice") || "0"
  const maxPrice = searchParams.get("maxPrice") || "20000"
  const sortBy = searchParams.get("sortBy") || "name"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Construir URL con todos los parámetros
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      if (categories) {
        categories.split(",").forEach((cat) => {
          if (cat.trim()) params.append("category", cat.trim())
        })
      }
      if (minPrice !== "0") params.set("minPrice", minPrice)
      if (maxPrice !== "20000") params.set("maxPrice", maxPrice)
      if (sortBy !== "name") params.set("sortBy", sortBy)
      if (sortOrder !== "asc") params.set("sortOrder", sortOrder)

      const response = await fetch(`/api/products?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        console.error("Los datos recibidos no son un array:", data)
        setProducts([])
        setError("Formato de datos inválido")
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [query, categories, minPrice, maxPrice, sortBy, sortOrder])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73]"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar productos: {error}</p>
        <Button onClick={fetchProducts} className="bg-[#005f73] hover:bg-[#003d4d]">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">No se encontraron productos que coincidan con los criterios de búsqueda.</p>
        <p className="text-gray-600 mb-4">Intenta con otros filtros o términos de búsqueda.</p>
        <Button onClick={fetchProducts} variant="outline" className="mr-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
        <Link href="/productos">
          <Button className="bg-[#005f73] hover:bg-[#003d4d]">Ver todos los productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Información de resultados */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {products.length} producto{products.length !== 1 ? "s" : ""}
          {categories && <span> en {categories.replace(",", ", ")}</span>}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Ordenado por {sortBy} ({sortOrder === "asc" ? "ascendente" : "descendente"})
          </p>
          <Button onClick={fetchProducts} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de productos */}
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
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-[#005f73] line-clamp-1">{product.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{product.category}</span>
              </div>

              <div className="text-[#2a9d8f] font-bold text-xl mb-2">${product.price.toLocaleString()}/kg</div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="text-sm text-gray-500 mb-4">Stock disponible: {product.stock} kg</div>

              {/* BOTONES ACTUALIZADOS - AMBOS SIEMPRE DISPONIBLES */}
              <div className="flex gap-2">
                {/* Botón Añadir al Carrito (stock inmediato) */}
                <Button
                  className="flex-1 bg-[#2a9d8f] hover:bg-[#21867a]"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Añadir
                </Button>

                {/* Botón Pre-orden (siempre disponible) */}
                <PreOrderButton 
                  productId={product.id.toString()}
                  productName={product.name}
                  variant="outline"
                  className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                />
              </div>

              {/* Botón Detalles */}
              <div className="mt-2">
                <Link href={`/productos/${product.id}`}>
                  <Button
                    variant="outline"
                    className="w-full border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Detalles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}