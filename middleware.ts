import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Rutas que requieren autenticación
const protectedRoutes = ["/profile", "/orders", "/checkout"]

// Rutas que son accesibles solo para usuarios no autenticados
const authRoutes = ["/register", "/forgot-password"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value
  const path = request.nextUrl.pathname

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))

  try {
    // Si hay token, verificarlo
    if (token) {
      // Verificar el token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-development-jwt-secret-key")
      await jwtVerify(token, secret)

      // Si el usuario está autenticado y trata de acceder a rutas de auth, redirigir a home
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } else if (isProtectedRoute) {
      // Si no hay token y la ruta requiere autenticación, redirigir al login
      return NextResponse.redirect(new URL("/", request.url))
    }
  } catch (error) {
    // Si el token no es válido y la ruta requiere autenticación, redirigir al login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/checkout/:path*", "/register", "/forgot-password"],
}
