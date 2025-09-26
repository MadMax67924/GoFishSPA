"use client"

import { useWishlist } from "@/contexts/wishlist-context"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist, itemCount } = useWishlist()
  const [loadingStates, setLoadingStates] = useState<{[key: number]: boolean}>({})

  // Función para agregar al carrito usando el mismo método que AddToCartButton
  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    setLoadingStates(prev => ({ ...prev, [productId]: true }))
    
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId.toString(),
          quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || "No se pudo agregar al carrito")
        return
      }

      const data = await response.json()
      toast.success("¡Producto agregado al carrito!")

      // Disparar evento para actualizar el carrito en tiempo real
      window.dispatchEvent(new CustomEvent("cartUpdated"))

      // Update local cart state (similar al AddToCartButton)
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingItemIndex = currentCart.findIndex((item: any) => item.productId === productId.toString())

      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity
      } else {
        currentCart.push({ productId: productId.toString(), quantity })
      }

      localStorage.setItem("cart", JSON.stringify(currentCart))
      window.dispatchEvent(new CustomEvent("cartUpdated"))

    } catch (error: any) {
      toast.error(error.message || "Error al agregar al carrito")
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handleRemoveFromWishlist = (productId: number, productName: string) => {
    removeFromWishlist(productId)
    toast.success(`${productName} removido de favoritos`)
  }

  const handleClearWishlist = () => {
    if (window.confirm("¿Estás seguro de que quieres vaciar toda tu lista de deseos?")) {
      clearWishlist()
      toast.success("Lista de deseos vaciada")
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                <div>
                  <h1 className="text-3xl font-bold text-[#005f73]">Lista de Deseos</h1>
                  <p className="text-gray-600">
                    {itemCount === 0 
                      ? "No tienes productos en tu lista de deseos" 
                      : `${itemCount} producto${itemCount > 1 ? 's' : ''} en tu lista de deseos`
                    }
                  </p>
                </div>
              </div>
              
              {itemCount > 0 && (
                <button
                  onClick={handleClearWishlist}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar Lista
                </button>
              )}
            </div>
          </div>

          {itemCount === 0 ? (
            <div className="text-center py-16">
              <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Tu lista de deseos está vacía</h2>
              <p className="text-gray-500 mb-6">Explora nuestros productos y agrega tus favoritos aquí</p>
              <Link 
                href="/productos" 
                className="inline-flex items-center gap-2 bg-[#2a9d8f] text-white px-6 py-3 rounded-lg hover:bg-[#238f7c] transition-colors"
              >
                Ver Productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                  <div className="relative">
                    <Link href={`/productos/${product.id}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id, product.name)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover de favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <Link href={`/productos/${product.id}`}>
                      <h3 className="font-semibold text-lg text-[#005f73] mb-2 hover:text-[#2a9d8f] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-[#2a9d8f]">
                        ${product.price.toLocaleString()}/kg
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center mb-3">
                      {product.stock > 0 ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-green-700 text-sm">En stock: {product.stock} kg</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-red-700 text-sm">Sin stock</span>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0 || loadingStates[product.id]}
                        className="w-full flex items-center justify-center gap-2 bg-[#2a9d8f] text-white py-2 px-4 rounded-lg hover:bg-[#238f7c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {loadingStates[product.id] 
                          ? "Agregando..." 
                          : "Agregar al Carrito"
                        }
                      </button>
                      
                      <Link 
                        href={`/productos/${product.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}