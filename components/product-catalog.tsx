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
  featured: boolean
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")

        if (!response.ok) {
          throw new Error("Error al cargar productos")
        }

        const data = await response.json()

        // Filtrar solo productos destacados y limitar a 4
        if (Array.isArray(data)) {
          const featuredProducts = data.filter((product: Product) => product.featured).slice(0, 4)
          setProducts(featuredProducts)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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

  return (
    <section className="bg-gray-50 py-16" id="productos">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">Nuestros Productos Destacados</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73]"></div>
            <span className="ml-2">Cargando productos...</span>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-5px]"
                >
                  <div className="relative h-48">
                    <Image
                      src={product.image || "/placeholder.svg?height=200&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#005f73] mb-2">{product.name}</h3>
                    <div className="text-[#2a9d8f] font-bold mb-3">${product.price.toLocaleString()}/kg</div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#2a9d8f] hover:bg-[#21867a] text-sm"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        Añadir
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

            <div className="text-center mt-8">
              <Link href="/productos">
                <Button className="bg-[#005f73] hover:bg-[#003d4d] px-8 py-3">Ver todos los productos</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No hay productos disponibles en este momento.</p>
            <Link href="/productos">
              <Button className="bg-[#005f73] hover:bg-[#003d4d]">Ver catálogo completo</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
