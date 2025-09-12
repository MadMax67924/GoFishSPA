import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductList from "@/components/product-list"
import ProductFilters from "@/components/product-filters"
import { Suspense } from "react"

export const metadata = {
  title: "Productos | GoFish SpA",
  description: "Catálogo completo de productos marinos frescos de GoFish SpA",
}

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-[#005f73]">Nuestro Catálogo</h1>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4">
              <ProductFilters />
            </div>

            <div className="w-full md:w-3/4">
              <Suspense fallback={<div className="text-center py-12">Cargando productos...</div>}>
                <ProductList />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
