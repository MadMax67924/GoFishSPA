import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TransferenciaBancariaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-[#005f73] mb-8">Transferencia Bancaria</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Datos Bancarios de GoFish SpA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Banco</h3>
                  <p className="text-gray-700">Banco de Chile</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Tipo de Cuenta</h3>
                  <p className="text-gray-700">Cuenta Corriente</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Número de Cuenta</h3>
                  <p className="text-gray-700 font-mono">123-45678-01</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">RUT Empresa</h3>
                  <p className="text-gray-700">76.123.456-7</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg mb-2">Razón Social</h3>
                  <p className="text-gray-700">GoFish SpA</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-lg mb-2">Email para confirmación</h3>
                  <p className="text-gray-700">contabilidad@gofishspa.cl</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Instrucciones importantes:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Realiza la transferencia por el monto exacto de tu pedido</li>
                  <li>• Envía el comprobante a contabilidad@gofishspa.cl</li>
                  <li>• Tu pedido será procesado una vez confirmemos el pago</li>
                  <li>• Tiempo de confirmación: 24-48 horas hábiles</li>
                  <li>• Número de pedido: GF-1763169579644-382</li>
                </ul>
              </div>

              <div className="flex gap-4 mt-6">
                <Button asChild variant="outline">
                  <Link href="/checkout">
                    Volver al Checkout
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/">
                    Finalizar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}