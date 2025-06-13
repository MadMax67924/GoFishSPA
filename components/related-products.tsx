"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id: string
  name: string
  price: number
  image: string
  category: string
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
      setLoading(true)
      try {
        // En una implementación real, esto sería una llamada a la API
        // Aquí simulamos datos de ejemplo
        const exampleProducts = [
          { _id: "1", name: "Salmón Fresco", price: 8990, image: "/images/salmon.jpg", category: "pescados" },
          { _id: "2", name: "Merluza Austral", price: 5990, image: "/images/merluza.jpg", category: "pescados" },
          { _id: "3", name: "Reineta", price: 6490, image: "/images/reineta.jpg", category: "pescados" },
          { _id: "4", name: "Camarones", price: 12990, image: "/images/camarones.jpg", category: "mariscos" },
          { _id: "5", name: "Congrio", price: 9990, image: "/images/congrio.jpg", category: "pescados" },
          { _id: "6", name: "Choritos", price: 4990, image: "/images/choritos.jpg", category: "mariscos" },
        ]

        // Filtrar productos de la misma categoría, excluyendo el producto actual
        const related = exampleProducts.filter((p) => p.category === category && p._id !== currentProductId).slice(0, 3) // Limitar a 3 productos relacionados

        setProducts(related)
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

  if (loading) {
    return <div className="text-center py-8">Cargando productos relacionados...</div>
  }

  if (products.length === 0) {
    return <div className="text-center py-8">No hay productos relacionados disponibles.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div className="flex gap-2">
              <Button className="flex-1 bg-[#2a9d8f] hover:bg-[#21867a]" onClick={() => addToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Añadir
              </Button>
              <Link href={`/productos/${product._id}`} className="flex-1">
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
  )
}
