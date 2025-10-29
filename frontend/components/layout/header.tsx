"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, ShoppingCart, User, Search, Heart, History, Mail, LogOut } from "lucide-react"
import LoginModal from "./login-modal"
import CartIndicator from "@/components/cart/cart-indicator"
import WishlistIndicator from "@/components/product/wishlist-indicator"
import AdvancedSearchBar from "@/components/search/search-bar"

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [usuario, setUsuario] = useState<any>(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ✅ Verificar si hay sesión activa
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUsuario(data.user)
        }
      } catch (error) {
        console.error("Error verificando sesión:", error)
      }
    }
    verificarSesion()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUsuario(null)
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 w-full bg-[#005f73] text-white py-4 z-50 transition-shadow ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Primera fila: Logo, buscador y acciones */}
          <div className="flex justify-between items-center mb-2">
            <Link href="/" className="text-2xl font-bold">
              GoFish SpA
            </Link>

            {/* Buscador - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <AdvancedSearchBar />
            </div>

            {/* Acciones - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 relative">
              {/* ✅ Si hay usuario logueado → Mostrar menú de perfil */}
              {usuario ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="hover:text-[#e9c46a] transition-colors flex items-center"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    {usuario.name?.split(" ")[0] || "Perfil"}
                  </Button>

                  {menuAbierto && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50 animate fade-in">
                      <Link
                        href="/perfil"
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setMenuAbierto(false)}
                      >
                        Perfil
                      </Link>
                      <Link
                        href="/seguridad"
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setMenuAbierto(false)}
                      >
                        Seguridad (MFA)
                      </Link>
                      <button
                        onClick={() => {
                          setMenuAbierto(false)
                          cerrarSesion()
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="hover:text-[#e9c46a] transition-colors"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </Button>
              )}

              {/* Resto de iconos sin tocar */}
              <Link href="/lista-deseados">
                <Button variant="ghost" className="hover:text-[#e9c46a] transition-colors relative">
                  <Heart className="h-5 w-5" />
                  <WishlistIndicator />
                </Button>
              </Link>
              <Link href="/historial">
                <Button variant="ghost" className="hover:text-[#e9c46a] transition-colors relative">
                  <History className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sugerencias">
                <Button variant="ghost" className="hover:text-[#e9c46a] transition-colors relative">
                  <Mail className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/carrito">
                <Button variant="ghost" className="hover:text-[#e9c46a] transition-colors relative">
                  <ShoppingCart className="h-5 w-5" />
                  <CartIndicator />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#005f73] text-white">
                <nav className="flex flex-col gap-4 mt-8">
                  {/* Buscador móvil */}
                  <div className="mb-4">
                    <form onSubmit={handleSearch} className="flex">
                      <Input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-r-none bg-white text-gray-900"
                      />
                      <Button type="submit" className="bg-[#2a9d8f] hover:bg-[#21867a] rounded-l-none px-3">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

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

                  {/* 🔹 En móvil también cambiamos el login */}
                  {usuario ? (
                    <>
                      <Link
                        href="/perfil"
                        className="text-lg hover:text-[#e9c46a] transition-colors"
                      >
                        Perfil
                      </Link>
                      <Link
                        href="/seguridad"
                        className="text-lg hover:text-[#e9c46a] transition-colors"
                      >
                        Seguridad (MFA)
                      </Link>
                      <button
                        onClick={cerrarSesion}
                        className="text-lg hover:text-red-400 transition-colors text-left"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      className="justify-start p-0 text-lg hover:text-[#e9c46a] transition-colors"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Iniciar Sesión
                    </Button>
                  )}

                  <Link
                    href="/lista-deseados"
                    className="text-lg hover:text-[#e9c46a] transition-colors relative inline-block"
                  >
                    <Heart className="h-5 w-5 inline mr-2" />
                    Lista de Deseos
                    <WishlistIndicator />
                  </Link>
                  <Link
                    href="/carrito"
                    className="text-lg hover:text-[#e9c46a] transition-colors relative inline-block"
                  >
                    <ShoppingCart className="h-5 w-5 inline mr-2" />
                    Carrito
                    <CartIndicator />
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Segunda fila: Navegación - Desktop */}
          <nav className="hidden lg:flex items-center justify-center space-x-8 border-t border-white/20 pt-2">
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
          </nav>
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
