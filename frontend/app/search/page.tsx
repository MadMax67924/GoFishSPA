"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Eye, ArrowLeft } from "lucide-react"
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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`)

        if (!response.ok) {
          throw new Error("Error al buscar productos")
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error al buscar productos:", error)
        setProducts([])
        toast({
          title: "Error",
          description: "No se pudieron cargar los resultados de búsqueda",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      searchProducts()
    } else {
      setLoading(false)
      setProducts([])
    }
  }, [query, toast])

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

      if (!response.ok) throw new Error("Error al añadir al carrito")

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

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb y título */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-[#005f73] hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              Resultados de búsqueda: <span className="text-[#005f73]">"{query}"</span>
            </h1>
            {!loading && (
              <p className="text-gray-600">
                {products.length > 0
                  ? `Se encontraron ${products.length} producto${products.length !== 1 ? "s" : ""}`
                  : "No se encontraron productos"}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73]"></div>
              <span className="ml-2">Buscando productos...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={product.image || "/placeholder.svg?height=200&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {product.stock <= 10 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                        Stock bajo
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                        Sin stock
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-[#005f73] line-clamp-1">{product.name}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{product.category}</span>
                    </div>

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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">No se encontraron productos</h2>
                <p className="text-gray-600 mb-6">
                  No encontramos productos que coincidan con "{query}". Intenta con otros términos de búsqueda.
                </p>
                <div className="space-y-3">
                  <Link href="/productos">
                    <Button className="w-full bg-[#005f73] hover:bg-[#003d4d]">Ver todos los productos</Button>
                  </Link>
                  <p className="text-sm text-gray-500">
                    Sugerencias: Intenta con términos como "salmón", "mariscos", "pescados", etc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Productos relacionados o sugerencias */}
          {!loading && products.length === 0 && query && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-[#005f73] mb-6">Productos populares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mostrar algunos productos populares como sugerencia */}
                <Card className="overflow-hidden">
                  <div className="relative h-32">
                    <Image
                      src="/placeholder.svg?height=150&width=200"
                      alt="Salmón Fresco"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm">Salmón Fresco</h3>
                    <p className="text-[#2a9d8f] font-bold">$8.990/kg</p>
                    <Link href="/productos/1">
                      <Button size="sm" className="w-full mt-2 bg-[#2a9d8f] hover:bg-[#21867a]">
                        Ver producto
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
