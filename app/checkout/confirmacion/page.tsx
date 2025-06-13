import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export const metadata = {
  title: "Pedido Confirmado | GoFish SpA",
  description: "Tu pedido ha sido confirmado con éxito",
}

export default function OrderConfirmationPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-[#005f73]">¡Pedido Confirmado!</h1>

            <p className="text-lg mb-6">Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Detalles del pedido</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-gray-600">Número de pedido:</p>
                  <p className="font-medium">GF-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha:</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estado:</p>
                  <p className="font-medium text-green-600">Confirmado</p>
                </div>
                <div>
                  <p className="text-gray-600">Método de pago:</p>
                  <p className="font-medium">Transferencia bancaria</p>
                </div>
              </div>
            </div>

            <p className="mb-8">
              Te hemos enviado un correo electrónico con los detalles de tu compra y las instrucciones para realizar el
              pago. Si tienes alguna pregunta, no dudes en contactarnos.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button className="bg-[#005f73] hover:bg-[#003d4d]">Volver al inicio</Button>
              </Link>
              <Link href="/productos">
                <Button variant="outline">Seguir comprando</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
