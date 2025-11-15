import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AppProviders } from "@/components/providers/app-providers"
import { Toaster } from "sonner"
import "./globals.css"
import { DeploymentStatusIndicator } from '@/components/deployment/deployment-status'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GoFish SpA - Distribuidora de Productos Marinos",
  description: "Distribuimos pescados y mariscos frescos manteniendo siempre la cadena de frío",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppProviders>
            {children}
            <Toaster richColors position="top-right" />
          </AppProviders>
        </ThemeProvider>
        <footer className="bg-teal-900 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>© 2025 GoFish SpA - Distribuidora de productos marinos</div>
            <DeploymentStatusIndicator />
          </div>
        </footer>
      </body>
    </html>
  )
}
