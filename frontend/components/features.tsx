export default function Features() {
  return (
    <section className="py-16" id="nosotros">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">¿Por qué elegirnos?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">❄️</div>
            <h3 className="text-xl font-semibold mb-3">Cadena de Frío</h3>
            <p className="text-gray-600">
              Mantenemos la cadena de frío en todo momento para garantizar la frescura de nuestros productos.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-3">Envío Rápido</h3>
            <p className="text-gray-600">
              Entregamos en 24-48 horas en la V Región con nuestro propio transporte refrigerado.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-3">Calidad Premium</h3>
            <p className="text-gray-600">
              Trabajamos directamente con pescaderías locales para ofrecer productos de la mejor calidad.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
