import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AddToCartButton from "@/components/add-to-cart-button"
import RelatedProducts from "@/components/related-products"
import ProductImageGallery from "@/components/product-image-gallery"
import { Suspense } from "react"

interface ProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string) {
  try {
    // Validate ID format
    const productId = Number.parseInt(id)
    if (isNaN(productId) || productId < 1) {
      console.log(`Invalid product ID: ${id}`)
      return null
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log(`Fetching product ${id}, status: ${response.status}`)

    if (!response.ok) {
      console.log(`Product ${id} not found, status: ${response.status}`)
      return null
    }

    const product = await response.json()
    console.log(`Product ${id} loaded successfully:`, product.name)
    return product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: "Producto no encontrado | GoFish SpA",
      description: "El producto que buscas no existe o ha sido eliminado.",
    }
  }

  return {
    title: `${product.name} | GoFish SpA`,
    description: product.description,
    openGraph: {
      title: `${product.name} | GoFish SpA`,
      description: product.description,
      images: product.images || [product.image],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log(`Loading product page for ID: ${params.id}`)

  const product = await getProduct(params.id)

  if (!product) {
    console.log(`Product ${params.id} not found, showing 404`)
    notFound()
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-600">
            <a href="/" className="hover:text-[#2a9d8f]">
              Inicio
            </a>
            <span className="mx-2">/</span>
            <a href="/productos" className="hover:text-[#2a9d8f]">
              Productos
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Product Images - Photo button removed */}
              <div className="relative">
                <ProductImageGallery
                  images={product.images || [product.image]}
                  productName={product.name}
                  showPhotoButton={false}
                />
              </div>

              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-[#005f73] mb-2">{product.name}</h1>
                <div className="text-2xl font-bold text-[#2a9d8f] mb-4">
                  ${product.price.toLocaleString("es-CL")}/kg
                </div>

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
                  <div className="text-sm text-gray-500 mt-1">ID del producto: #{product.id}</div>
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
