"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id: string
  name: string
  price: number
  image: string
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) throw new Error("Error al cargar productos")
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error:", error)
        // Usar datos de ejemplo si falla la carga
        setProducts([
          { _id: "1", name: "Salmón Fresco", price: 8990, image: "/images/salmon.jpg" },
          { _id: "2", name: "Merluza Austral", price: 5990, image: "/images/merluza.jpg" },
          { _id: "3", name: "Reineta", price: 6490, image: "/images/reineta.jpg" },
          { _id: "4", name: "Camarones", price: 12990, image: "/images/camarones.jpg" },
        ])
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
    <section className="bg-gray-50 py-16" id="productos">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">Nuestros Productos</h2>

        {loading ? (
          <div className="text-center">Cargando productos...</div>
        ) : (
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
        )}
      </div>
    </section>
  )
}
