import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StripeCheckoutSession from "@/components/checkout/checkout-session";

export const metadata = {
  title: "Checkout Seguro | GoFish SpA",
  description: "Completa tu pago de forma segura con Stripe",
}

//Muestra la pagina de redireccion de pago
export default function PaymentPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <StripeCheckoutSession />
        </div>
      </main>
      <Footer />
    </>
  )
}