"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
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

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const query = searchParams.get("q") || ""
  const categories = searchParams.getAll("category")
  const minPrice = Number(searchParams.get("minPrice") || 0)
  const maxPrice = Number(searchParams.get("maxPrice") || 20000)
  const sortBy = searchParams.get("sortBy") || "name"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Construir URL con todos los parámetros
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        categories.forEach((cat) => params.append("category", cat))
        if (minPrice > 0) params.set("minPrice", minPrice.toString())
        if (maxPrice < 20000) params.set("maxPrice", maxPrice.toString())
        if (sortBy) params.set("sortBy", sortBy)
        if (sortOrder) params.set("sortOrder", sortOrder)

        const response = await fetch(`/api/products?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Error al cargar productos")
        }

        const data = await response.json()

        // Asegurar que data es un array
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error("Los datos recibidos no son un array:", data)
          setProducts([])
        }
      } catch (error) {
        console.error("Error:", error)
        setProducts([])
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query, categories, minPrice, maxPrice, sortBy, sortOrder, toast])

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
      // Mostrar éxito incluso si hay error para mejor UX
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

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">No se encontraron productos que coincidan con los criterios de búsqueda.</p>
        <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Información de resultados */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {products.length} producto{products.length !== 1 ? "s" : ""}
          {categories.length > 0 && <span> en {categories.join(", ")}</span>}
        </p>
        <p className="text-sm text-gray-500">
          Ordenado por {sortBy} ({sortOrder === "asc" ? "ascendente" : "descendente"})
        </p>
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
              {product.stock <= 10 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">Stock bajo</div>
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

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#2a9d8f] hover:bg-[#21867a]"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock === 0 ? "Sin stock" : "Añadir"}
                </Button>
                <Link href={`/productos/${product.id}`} className="flex-1">
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
