export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">Lo que dicen nuestros clientes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="italic mb-4 text-gray-700">
              "Los productos de GoFish son siempre frescos y de excelente calidad. Nuestros clientes en el restaurante
              siempre preguntan por el origen del pescado."
            </p>
            <p className="font-semibold text-[#005f73]">- Chef Juan Pérez, Restaurante Mar Adentro</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="italic mb-4 text-gray-700">
              "La atención al cliente es excelente y nunca hemos tenido problemas con la cadena de frío. Recomendado
              100%."
            </p>
            <p className="font-semibold text-[#005f73]">- María González, Mercado del Mar</p>
          </div>
        </div>
      </div>
    </section>
  )
}
