import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="text-6xl font-bold text-[#005f73] mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado de nuestro catálogo.</p>
        </div>

        <div className="space-y-4">
          <Link href="/productos">
            <Button className="w-full bg-[#005f73] hover:bg-[#003d4d]">
              <Search className="mr-2 h-4 w-4" />
              Ver todos los productos
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            ¿Necesitas ayuda?{" "}
            <Link href="/contacto" className="text-[#005f73] hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
