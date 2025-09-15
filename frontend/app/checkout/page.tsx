import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CheckoutForm from "@/components/checkout/checkout-form";
import CheckoutSummary from "@/components/checkout/checkout-summary";

import { Suspense } from "react"

export const metadata = {
  title: "Finalizar Compra | GoFish SpA",
  description: "Completa tu pedido de productos marinos frescos",
}

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-[#005f73]">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>

            <div className="lg:col-span-1">
              <Suspense fallback={<div className="text-center py-12">Cargando resumen...</div>}>
                <CheckoutSummary />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
