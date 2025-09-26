"use client"

import type React from "react"
import { WishlistProvider } from "@/contexts/wishlist-context"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      {children}
    </WishlistProvider>
  )
}