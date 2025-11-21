import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Solo monitorear en producción
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  
  // Agregar headers para monitoreo de actividad
  response.headers.set('X-User-Activity', 'detected')
  response.headers.set('X-Deployment-Check', new Date().toISOString())
  
  // Log actividad crítica (páginas importantes)
  const criticalPaths = ['/productos', '/carrito', '/checkout']
  if (criticalPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    // Aquí podrías hacer un log a base de datos de actividad crítica
    response.headers.set('X-Critical-Activity', 'true')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}