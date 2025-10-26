/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para GitHub Pages - NUEVO
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Si tu repositorio se llama "GoFishSPA", agrega estas líneas:
  basePath: '/GoFishSPA',
  assetPrefix: '/GoFishSPA/',
  
  // Configuración existente - MANTENER
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
