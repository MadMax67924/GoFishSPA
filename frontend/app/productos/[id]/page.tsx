"use client"
import { notFound } from "next/navigation"
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AddToCartButton from "@/components/cart/add-to-cart-button"
import AddToWishlistButton from "@/components/product/add-to-wishlist-button"
import PreOrderButton from "@/components/product/pre-order-button"
import RelatedProducts from "@/components/product/related-products"
import ProductImageGallery from "@/components/product/product-image-gallery"
import { Suspense, useEffect, useState, use } from "react"
import { getProductById } from "@/lib/server/products-data"

// IMPORTA LOS COMPONENTES DE RESEÑAS
import ReviewForm from "@/components/reviews/review-form"
import ReviewList from "@/components/reviews/review-list"
import ReviewsSection from "@/components/reviews/reviews-section"

// IMPORTA LOS COMPONENTES DE PROMOCIÓN
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Badge } from '@/components/ui/badge';

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params)
  const productId = Number.parseInt(resolvedParams.id)
  const product = getProductById(productId)

  const [reviews, setReviews] = useState<any[]>([])

  // Configuración de promoción para Langostinos (ID específico o nombre)
  const isLangostinosPromotion = product?.name?.toLowerCase().includes('langostino') || productId === 9;
  const promotionEndDate = new Date();
  promotionEndDate.setDate(promotionEndDate.getDate() + 7); // 7 días desde hoy
  
  // CORRECCIÓN: El precio de producto es el precio con descuento, calculamos el original
  const discountPercentage = 23;
  let discountPrice: number;
  let originalPrice: number;

  if (isLangostinosPromotion) {
    // Para Langostinos: precios específicos
    originalPrice = 29887;    // Precio original fijo
    discountPrice = 22990;    // Precio con descuento fijo
  } else {
    // Para otros productos: usar precio normal
    discountPrice = product?.price || 0;
    originalPrice = product?.price || 0;
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/upload?productId=${productId}`)
      if (!res.ok) throw new Error('Error fetching reviews')
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  if (!product) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Banner promocional para Langostinos */}
          {isLangostinosPromotion && (
            <div className="mb-6">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Información de la promoción */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Badge variant="destructive" className="text-lg px-3 py-1">
                        🔥 {discountPercentage}% OFF
                      </Badge>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      ¡{product.name} en Promoción Especial!
                    </h2>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                      <span className="text-2xl font-bold text-green-600">
                        ${discountPrice?.toLocaleString('es-CL') || '0'}/kg
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${originalPrice?.toLocaleString('es-CL') || '0'}/kg
                      </span>
                    </div>
                    
                    <p className="text-gray-600">
                      ¡Ahorra ${(originalPrice - discountPrice).toLocaleString('es-CL')} por kg en esta promoción limitada!
                    </p>
                  </div>
                  
                  {/* Temporizador */}
                  <div className="flex-shrink-0">
                    <CountdownTimer 
                      targetDate={promotionEndDate}
                      title="¡Promoción termina en!"
                      className="max-w-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* CU20: Galería de imágenes en alta calidad */}
              <div className="relative">
                <ProductImageGallery images={product.images || [product.image]} productName={product.name} />
                
                {/* Badge promocional en la imagen */}
                {isLangostinosPromotion && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="destructive" className="text-sm font-bold px-3 py-1">
                      -{discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-[#005f73] mb-2 flex items-center gap-3">
                  {product.name}
                  {product.stock === 0 && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                      Disponible para preorden
                    </span>
                  )}
                  {/* Badge de promoción en el título */}
                  {isLangostinosPromotion && (
                    <span className="text-sm font-bold px-2 py-1 rounded bg-red-500 text-white">
                      ¡OFERTA!
                    </span>
                  )}
                </h1>
                
                {/* Precio con promoción */}
                <div className="mb-4">
                  {isLangostinosPromotion ? (
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-green-600">
                        ${discountPrice?.toLocaleString() || '0'}/kg
                      </div>
                      <div className="text-xl text-gray-500 line-through">
                        ${originalPrice?.toLocaleString() || '0'}/kg
                      </div>
                      <Badge variant="destructive" className="text-sm">
                        Ahorra ${(originalPrice - discountPrice).toLocaleString()}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-[#2a9d8f]">
                      ${product.price?.toLocaleString() || '0'}/kg
                    </div>
                  )}
                </div>

                {/* Temporizador pequeño en mobile */}
                {isLangostinosPromotion && (
                  <div className="block lg:hidden mb-4">
                    <CountdownTimer 
                      targetDate={promotionEndDate}
                      title="Termina en:"
                      className="text-sm"
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h2 className="font-semibold mb-2">Descripción</h2>
                  <p className="text-gray-700">{product.description}</p>
                  
                  {/* Descripción especial para promoción */}
                  {isLangostinosPromotion && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">
                        🔥 <strong>Promoción especial:</strong> Langostinos de primera calidad con {discountPercentage}% de descuento. 
                        ¡Ideal para preparaciones gourmet!
                      </p>
                    </div>
                  )}
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

                <div className="mt-auto space-y-4">
                  {/* BOTONES - SIN ANIMACIÓN NI COLOR ROJO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Botón Añadir al Carrito - COLORES NORMALES */}
                    {product.stock > 0 && (
                      <AddToCartButton 
                        productId={product.id.toString()} 
                        className="w-full font-bold h-12 bg-[#2a9d8f] hover:bg-[#21867a] text-white"
                      />
                    )}
                    
                    {/* Botón Pre-orden - SIEMPRE disponible */}
                    <PreOrderButton 
                      productId={product.id.toString()}
                      productName={product.name}
                      className="w-full h-12"
                    />
                  </div>

                  {/* Wishlist */}
                  <AddToWishlistButton product={product} />
                  
                  {/* Mensaje informativo cuando no hay stock */}
                  {product.stock === 0 && (
                    <div className="p-3 rounded-md bg-orange-50 text-orange-800 border border-orange-200 text-sm">
                      <strong>📦 Producto en pre-orden:</strong> Se reservará y te notificaremos cuando esté disponible.
                    </div>
                  )}

                  {/* Mensaje especial para promoción */}
                  {isLangostinosPromotion && product.stock > 0 && (
                    <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 text-sm">
                      <strong>⚡ ¡Promoción por tiempo limitado!</strong> No te pierdas esta oferta especial en langostinos frescos.
                    </div>
                  )}
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