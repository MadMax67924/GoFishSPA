import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AddToCartButton from "@/components/add-to-cart-button"
import RelatedProducts from "@/components/related-products"
import ProductImageGallery from "@/components/product-image-gallery"
import { Suspense } from "react"

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProduct(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const product = await response.json()
    return product
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: "Producto no encontrado | GoFish SpA",
      description: "El producto que buscas no existe o ha sido eliminado.",
    }
  }

  return {
    title: `${product.name} | GoFish SpA`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

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
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
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
