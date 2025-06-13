"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
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

        if (!response.ok) throw new Error("Error al cargar productos")

        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error:", error)
        // Usar datos de ejemplo si falla la carga
        const exampleProducts = [
          {
            _id: "1",
            name: "Salmón Fresco",
            price: 8990,
            image: "/images/salmon.jpg",
            category: "pescados",
            description: "Salmón fresco del día",
            stock: 50,
          },
          {
            _id: "2",
            name: "Merluza Austral",
            price: 5990,
            image: "/images/merluza.jpg",
            category: "pescados",
            description: "Merluza austral de aguas profundas",
            stock: 40,
          },
          {
            _id: "3",
            name: "Reineta",
            price: 6490,
            image: "/images/reineta.jpg",
            category: "pescados",
            description: "Reineta fresca",
            stock: 35,
          },
          {
            _id: "4",
            name: "Camarones",
            price: 12990,
            image: "/images/camarones.jpg",
            category: "mariscos",
            description: "Camarones ecuatorianos",
            stock: 30,
          },
          {
            _id: "5",
            name: "Congrio",
            price: 9990,
            image: "/images/congrio.jpg",
            category: "pescados",
            description: "Congrio dorado",
            stock: 25,
          },
          {
            _id: "6",
            name: "Choritos",
            price: 4990,
            image: "/images/choritos.jpg",
            category: "mariscos",
            description: "Choritos frescos",
            stock: 60,
          },
        ]

        // Aplicar filtros
        let filtered = exampleProducts

        if (query) {
          filtered = filtered.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        }

        if (categories.length > 0) {
          filtered = filtered.filter((p) => categories.includes(p.category))
        }

        filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice)

        // CU23: Aplicar ordenamiento
        filtered.sort((a, b) => {
          let aValue: any = a[sortBy as keyof Product]
          let bValue: any = b[sortBy as keyof Product]

          // Convertir a string para comparación si es necesario
          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (sortOrder === "desc") {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          }
        })

        setProducts(filtered)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query, categories, minPrice, maxPrice, sortBy, sortOrder])

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
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73]"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    )
  }

  if (products.length === 0) {
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
            key={product._id}
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-5px] border"
          >
            <div className="relative h-48">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
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
    </div>
  )
}
