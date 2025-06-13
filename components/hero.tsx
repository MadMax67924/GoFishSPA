import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="hero flex items-center text-center text-white mt-16" id="inicio">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Productos Marinos de la Más Alta Calidad</h1>
        <p className="text-xl mb-8">Distribuimos pescados y mariscos frescos manteniendo siempre la cadena de frío</p>
        <Link href="#productos">
          <Button className="bg-[#e9c46a] text-gray-800 hover:bg-[#f4a261] text-lg px-6 py-3 rounded-md font-medium">
            Ver Catálogo
          </Button>
        </Link>
      </div>
    </section>
  )
}
