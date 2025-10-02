import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ContactFormPage from "@/components/forms/contact-form-page"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import Link from "next/link";

export const metadata = {
  title: "Contacto | GoFish SpA",
  description:
    "Ponte en contacto con GoFish SpA. Estamos aquí para ayudarte con tus pedidos de productos marinos frescos",
}

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#005f73] to-[#0a9396] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contáctanos</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta sobre nuestros
              productos marinos frescos.
            </p>
          </div>
        </section>

        {/* Información de Contacto */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-[#005f73] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#005f73]">Dirección</h3>
                  <p className="text-gray-600">PC 58 Lajarilla del Puente</p>
                  <p className="text-gray-600">Concón, V Región</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-[#2a9d8f] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#005f73]">Teléfono</h3>
                  <p className="text-gray-600">+56 9 8765 4321</p>
                  <p className="text-sm text-gray-500">Lun - Vie: 8:00 - 18:00</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-[#e9c46a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#005f73]">Email</h3>
                  <p className="text-gray-600">contacto@gofish.cl</p>
                  <p className="text-sm text-gray-500">Respuesta en 24h</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-[#f4a261] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[#005f73]">Horarios</h3>
                  <p className="text-gray-600">Lun - Vie: 8:00 - 18:00</p>
                  <p className="text-gray-600">Sáb: 8:00 - 14:00</p>
                </CardContent>
              </Card>
            </div>

            {/* Formulario de Contacto y Mapa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Formulario */}
              <div>
                <h2 className="text-3xl font-bold text-[#005f73] mb-6">Envíanos un mensaje</h2>
                <ContactFormPage />
                <div className="mt-8 text-center">
                  <Link href="/proveedores">
                    <button className="bg-[#005f73] text-white px-6 py-3 rounded-md hover:bg-[#003d4d] transition">
                      ¿Eres proveedor? Regístrate aquí
                    </button>
                  </Link>
                </div>
              </div>

              {/* Información adicional y mapa */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#005f73] mb-6">Cómo llegar</h2>
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-6">
                    <p className="text-gray-500">Mapa de ubicación</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">En auto</h3>
                      <p className="text-gray-700">
                        Desde Viña del Mar, tomar Ruta 62 hacia Concón. Continuar por Av. Borgoño hasta llegar a
                        Lajarilla del Puente.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">En transporte público</h3>
                      <p className="text-gray-700">
                        Tomar micro hacia Concón desde Viña del Mar o Valparaíso. Bajar en paradero Lajarilla del
                        Puente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-[#005f73]">¿Necesitas ayuda inmediata?</h3>
                  <p className="text-gray-700 mb-4">
                    Para pedidos urgentes o consultas sobre disponibilidad de productos, puedes contactarnos
                    directamente por WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/56987654321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">Preguntas Frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-[#005f73]">¿Cuál es el tiempo de entrega?</h3>
                <p className="text-gray-700 mb-4">
                  Entregamos en 24-48 horas en la V Región. Para otras regiones, consulta tiempos específicos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-[#005f73]">¿Cómo garantizan la frescura?</h3>
                <p className="text-gray-700 mb-4">
                  Mantenemos la cadena de frío desde la captura hasta la entrega con transporte refrigerado
                  especializado.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-[#005f73]">¿Cuál es el pedido mínimo?</h3>
                <p className="text-gray-700 mb-4">
                  No tenemos pedido mínimo. Puedes comprar desde 1 kg de cualquier producto.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-[#005f73]">¿Aceptan devoluciones?</h3>
                <p className="text-gray-700 mb-4">
                  Sí, aceptamos devoluciones dentro de las primeras 2 horas de entrega si el producto no cumple con
                  nuestros estándares de calidad.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
