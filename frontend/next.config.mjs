/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Agregar configuración para variables de entorno
  env: {
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
  // Asegurar que las variables de entorno se carguen
  serverRuntimeConfig: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
  publicRuntimeConfig: {
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
}

export default nextConfig