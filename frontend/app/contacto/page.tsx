import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ContactFormPage from "@/components/forms/contact-form-page";
import FAQSection from "@/components/faq/faq-section";
import ContactInfoSection from "@/components/contact/contact-info-section";
import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Contacto | GoFish SpA",
  description:
    "Ponte en contacto con GoFish SpA. Estamos aquí para ayudarte con tus pedidos de productos marinos frescos",
};

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

        {/* Información de Contacto - Ahora usando el componente */}
        <ContactInfoSection />

        {/* Resto del contenido existente */}
        <section className="py-16">
          <div className="container mx-auto px-4">
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

              {/* Información adicional */}
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
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
