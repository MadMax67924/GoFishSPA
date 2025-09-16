"use client"
import { notFound } from "next/navigation"
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AddToCartButton from "@/components/cart/add-to-cart-button"
import RelatedProducts from "@/components/product/related-products"
import ProductImageGallery from "@/components/product/product-image-gallery"
import { Suspense } from "react"
import { getProductById } from "@/lib/server/products-data"

// IMPORTA LOS COMPONENTES DE RESEÑAS
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

  // --- INICIO: LÓGICA DE RESEÑAS ---
  const [reviews, setReviews] = useState<any[]>([])

  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews?productId=${productId}`)
    const data = await res.json()
    setReviews(data)
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // --- FIN: LÓGICA DE RESEÑAS ---

  if (!product) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* CU20: Galería de imágenes en alta calidad */}
              <div className="relative">
                <ProductImageGallery images={product.images || [product.image]} productName={product.name} />
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-[#005f73] mb-2">{product.name}</h1>
                <div className="text-2xl font-bold text-[#2a9d8f] mb-4">${product.price.toLocaleString()}/kg</div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h2 className="font-semibold mb-2">Descripción</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    {product.stock > 0 ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-green-700">En stock: {product.stock} kg disponibles</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-red-700">Sin stock</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Categoría: <span className="font-medium capitalize">{product.category}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <AddToCartButton productId={product.id.toString()} />
                </div>
              </div>
            </div>
          </div>

          {/* --- SECCIÓN DE RESEÑAS --- */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Reseñas del producto</h2>
            <ReviewForm productId={product.id.toString()} onNewReview={fetchReviews} />
            <ReviewList reviews={reviews} />
          </div>
          {/* --- FIN SECCIÓN DE RESEÑAS --- */}

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