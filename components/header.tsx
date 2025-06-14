"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ShoppingCart, User } from "lucide-react"
import LoginModal from "./login-modal"
import CartIndicator from "./cart-indicator"

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 w-full bg-[#005f73] text-white py-4 z-50 transition-shadow ${isScrolled ? "shadow-lg" : ""}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            GoFish SpA
          </Link>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#005f73] text-white">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg hover:text-[#e9c46a] transition-colors">
                  Inicio
                </Link>
                <Link href="/productos" className="text-lg hover:text-[#e9c46a] transition-colors">
                  Productos
                </Link>
                <Link href="/nosotros" className="text-lg hover:text-[#e9c46a] transition-colors">
                  Nosotros
                </Link>
                <Link href="/contacto" className="text-lg hover:text-[#e9c46a] transition-colors">
                  Contacto
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start p-0 text-lg hover:text-[#e9c46a] transition-colors"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Iniciar Sesión
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop menu */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="hover:text-[#e9c46a] transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-[#e9c46a] transition-colors">
              Productos
            </Link>
            <Link href="/nosotros" className="hover:text-[#e9c46a] transition-colors">
              Nosotros
            </Link>
            <Link href="/contacto" className="hover:text-[#e9c46a] transition-colors">
              Contacto
            </Link>
            <Button
              variant="ghost"
              className="hover:text-[#e9c46a] transition-colors"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <User className="h-5 w-5 mr-2" />
              Iniciar Sesión
            </Button>
            <Link href="/carrito">
              <Button variant="ghost" className="hover:text-[#e9c46a] transition-colors relative">
                <ShoppingCart className="h-5 w-5" />
                <CartIndicator />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
