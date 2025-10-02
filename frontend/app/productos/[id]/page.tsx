"use client"
import { notFound } from "next/navigation"
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AddToCartButton from "@/components/cart/add-to-cart-button"
import AddToWishlistButton from "@/components/product/add-to-wishlist-button"
import PreorderButton from "@/components/product/preorder-button" // 🆕 NUEVO IMPORT
import RelatedProducts from "@/components/product/related-products"
import ProductImageGallery from "@/components/product/product-image-gallery"
import { Suspense } from "react"
import { getProductById } from "@/lib/server/products-data"
import ReviewForm from "@/components/reviews/review-form"
import ReviewList from "@/components/reviews/review-list"
import { useEffect, useState } from "react"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const productId = Number.parseInt(params.id)
  const product = getProductById(productId)

  const [reviews, setReviews] = useState<any[]>([])

  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews/upload?productId=${productId}`)
    const data = await res.json()
    setReviews(data)
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!product) {
    notFound()
  }

  const hasStock = product.stock > 0

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Galería de imágenes */}
              <div className="relative">
                <ProductImageGallery images={product.images || [product.image]} productName={product.name} />
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-[#005f73] mb-2 flex items-center gap-3">
                  {product.name}
                  {!hasStock && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                      Disponible para preorden
                    </span>
                  )}
                </h1>
                <div className="text-2xl font-bold text-[#2a9d8f] mb-4">${product.price.toLocaleString()}/kg</div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h2 className="font-semibold mb-2">Descripción</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    {hasStock ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-green-700">En stock: {product.stock} kg disponibles</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-orange-700">Sin stock - Disponible para preorden</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Categoría: <span className="font-medium capitalize">{product.category}</span>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  {hasStock ? (
                    <>
                      <AddToCartButton 
                        productId={product.id.toString()} 
                        className="w-full py-3"
                      />
                      <AddToWishlistButton product={product} />
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="flex items-start mb-3">
                          <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-orange-800 font-medium">Producto sin stock</p>
                            <p className="text-orange-700 text-sm">Preordena ahora y te notificaremos cuando esté disponible (estimado: 2-3 semanas)</p>
                          </div>
                        </div>
                        
                        {/* 🆕 BOTÓN DE PREORDEN */}
                        <PreorderButton 
                          productId={product.id.toString()}
                          productName={product.name}
                          quantity={1}
                          className="mt-2"
                        />
                      </div>
                      
                      <AddToWishlistButton product={product} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de reseñas */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Reseñas del producto</h2>
            <ReviewForm productId={product.id.toString()} onNewReview={fetchReviews} />
            <ReviewList reviews={reviews} />
          </div>

          {/* Productos relacionados */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
            <Suspense fallback={<div className="text-center py-8">Cargando productos relacionados...</div>}>
              <RelatedProducts currentProductId={product.id.toString()} category={product.category} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}