import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartItems from "@/components/cart/cart-items"
import CartSummary from "@/components/cart/cart-summary"
import { Suspense } from "react"

export const metadata = {
  title: "Carrito de Compras | GoFish SpA",
  description: "Revisa y gestiona los productos en tu carrito de compras",
}

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-[#005f73]">Carrito de Compras</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Suspense fallback={<div className="text-center py-12">Cargando carrito...</div>}>
                <CartItems />
              </Suspense>
            </div>

            <div className="lg:col-span-1">
              <Suspense fallback={<div className="text-center py-12">Cargando resumen...</div>}>
                <CartSummary />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
