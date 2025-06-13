"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id: string
  name: string
  price: number
  image: string
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
        // En una implementación real, aquí se enviaría una solicitud a la API
        // para buscar productos según el query

        // Simulamos una respuesta con datos de ejemplo
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Datos de ejemplo filtrados por el query
        const exampleProducts = [
          { _id: "1", name: "Salmón Fresco", price: 8990, image: "/images/salmon.jpg" },
          { _id: "2", name: "Merluza Austral", price: 5990, image: "/images/merluza.jpg" },
          { _id: "3", name: "Reineta", price: 6490, image: "/images/reineta.jpg" },
          { _id: "4", name: "Camarones", price: 12990, image: "/images/camarones.jpg" },
        ]

        const filteredProducts = exampleProducts.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase()),
        )

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error al buscar productos:", error)
      } finally {
        setLoading(false)
      }
    }

    searchProducts()
  }, [query])

  const addToCart = async (product: Product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
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
        variant: "default",
      })
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">
            Resultados de búsqueda: <span className="text-[#005f73]">"{query}"</span>
          </h1>

          {loading ? (
            <div className="text-center py-12">Buscando productos...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-5px]"
                >
                  <div className="relative h-48">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#005f73]">{product.name}</h3>
                    <div className="text-[#2a9d8f] font-bold my-2">${product.price.toLocaleString()}/kg</div>
                    <Button className="w-full bg-[#2a9d8f] hover:bg-[#21867a]" onClick={() => addToCart(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Añadir al carrito
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg mb-4">No se encontraron productos que coincidan con "{query}"</p>
              <p>Intenta con otra búsqueda o explora nuestro catálogo completo</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
