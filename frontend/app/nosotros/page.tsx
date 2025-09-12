import Header from "@/components/header"
import Footer from "@/components/footer"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, Snowflake, Star, Users, Award, Clock } from "lucide-react"

export const metadata = {
  title: "Nosotros | GoFish SpA",
  description:
    "Conoce más sobre GoFish SpA, distribuidora de productos marinos frescos con más de 10 años de experiencia",
}

export default function NosotrosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#005f73] to-[#0a9396] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre GoFish SpA</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Más de 10 años distribuyendo productos marinos frescos, manteniendo siempre la cadena de frío para
              garantizar la máxima calidad.
            </p>
          </div>
        </section>

        {/* Nuestra Historia */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#005f73] mb-6">Nuestra Historia</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    GoFish SpA nació en 2014 con una visión clara: llevar los productos marinos más frescos y de mejor
                    calidad desde las costas chilenas hasta la mesa de nuestros clientes.
                  </p>
                  <p>
                    Comenzamos como una pequeña empresa familiar en la V Región, trabajando directamente con pescadores
                    locales y estableciendo relaciones de confianza que perduran hasta hoy.
                  </p>
                  <p>
                    A lo largo de los años, hemos crecido manteniendo nuestros valores fundamentales: calidad, frescura,
                    confiabilidad y un servicio excepcional al cliente.
                  </p>
                </div>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Historia de GoFish SpA"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Nuestra Misión y Visión */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8">
                <CardContent className="text-center">
                  <div className="w-16 h-16 bg-[#005f73] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#005f73] mb-4">Nuestra Misión</h3>
                  <p className="text-gray-700">
                    Distribuir productos marinos de la más alta calidad, manteniendo la cadena de frío desde el origen
                    hasta el destino, para satisfacer las necesidades de nuestros clientes con excelencia y
                    confiabilidad.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8">
                <CardContent className="text-center">
                  <div className="w-16 h-16 bg-[#2a9d8f] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#005f73] mb-4">Nuestra Visión</h3>
                  <p className="text-gray-700">
                    Ser la distribuidora de productos marinos líder en la región, reconocida por nuestra calidad,
                    innovación y compromiso con la sostenibilidad marina y el desarrollo de nuestras comunidades.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">¿Por qué elegirnos?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Snowflake className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#005f73]">Cadena de Frío</h3>
                  <p className="text-gray-600">
                    Mantenemos la temperatura controlada en todo momento, desde la captura hasta la entrega,
                    garantizando la frescura absoluta.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#005f73]">Entrega Rápida</h3>
                  <p className="text-gray-600">
                    Entregamos en 24-48 horas en la V Región con nuestro propio transporte refrigerado especializado.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#005f73]">Calidad Premium</h3>
                  <p className="text-gray-600">
                    Trabajamos directamente con pescaderías locales y aplicamos estrictos controles de calidad en cada
                    etapa.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Nuestro Equipo */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">Nuestro Compromiso</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#005f73] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#005f73]">500+</h3>
                <p className="text-gray-600">Clientes satisfechos</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#2a9d8f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#005f73]">10+</h3>
                <p className="text-gray-600">Años de experiencia</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#e9c46a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#005f73]">24-48h</h3>
                <p className="text-gray-600">Tiempo de entrega</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#f4a261] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#005f73]">100%</h3>
                <p className="text-gray-600">Calidad garantizada</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#005f73] mb-6">Nuestra Ubicación</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dirección</h3>
                    <p className="text-gray-700">PC 58 Lajarilla del Puente - Concón, V Región</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Horarios de Atención</h3>
                    <p className="text-gray-700">Lunes a Viernes: 8:00 - 18:00</p>
                    <p className="text-gray-700">Sábados: 8:00 - 14:00</p>
                    <p className="text-gray-700">Domingos: Cerrado</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Contacto</h3>
                    <p className="text-gray-700">Teléfono: +56 9 8765 4321</p>
                    <p className="text-gray-700">Email: contacto@gofish.cl</p>
                  </div>
                </div>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-lg bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Mapa de ubicación</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
