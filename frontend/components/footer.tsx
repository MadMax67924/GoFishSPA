import Link from "next/link"
import { Facebook, Instagram, MessageSquare } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#005f73] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">GoFish SpA</h3>
            <p>Distribuidora de productos marinos frescos manteniendo siempre la cadena de frío.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Contacto</h3>
            <p>PC 58 Lajarilla del Puente - Concón</p>
            <p>contacto@gofish.cl</p>
            <p>+56 9 8765 4321</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-[#e9c46a] transition-colors">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-[#e9c46a] transition-colors">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-[#e9c46a] transition-colors">
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">WhatsApp</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/20 text-center">
          <p>&copy; 2025 GoFish SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
