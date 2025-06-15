// Sistema de carrito en memoria para funcionar sin base de datos

interface CartItem {
  id: string
  productId: number
  quantity: number
  addedAt: Date
}

class CartStorage {
  private items: Map<string, CartItem> = new Map()
  private cartId = ""

  constructor() {
    if (typeof window !== "undefined") {
      this.cartId = this.getOrCreateCartId()
      this.loadFromLocalStorage()
    }
  }

  private getOrCreateCartId(): string {
    let cartId = localStorage.getItem("cartId")
    if (!cartId) {
      cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("cartId", cartId)
    }
    return cartId
  }

  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(`cart_${this.cartId}`)
      if (stored) {
        const items = JSON.parse(stored)
        this.items = new Map(
          items.map((item: any) => [
            item.id,
            {
              ...item,
              addedAt: new Date(item.addedAt),
            },
          ]),
        )
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
  }

  private saveToLocalStorage() {
    try {
      const items = Array.from(this.items.values())
      localStorage.setItem(`cart_${this.cartId}`, JSON.stringify(items))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }

  // CU25: Añadir productos al carrito
  addItem(productId: number, quantity: number): string {
    const existingItem = Array.from(this.items.values()).find((item) => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += quantity
      this.items.set(existingItem.id, existingItem)
    } else {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newItem: CartItem = {
        id: itemId,
        productId,
        quantity,
        addedAt: new Date(),
      }
      this.items.set(itemId, newItem)
    }

    this.saveToLocalStorage()
    return existingItem?.id || `item_${Date.now()}`
  }

  // CU26: Modificar cantidad en carrito
  updateQuantity(itemId: string, quantity: number): boolean {
    const item = this.items.get(itemId)
    if (!item) return false

    if (quantity <= 0) {
      return this.removeItem(itemId)
    }

    item.quantity = quantity
    this.items.set(itemId, item)
    this.saveToLocalStorage()
    return true
  }

  // CU27: Eliminar productos del carrito
  removeItem(itemId: string): boolean {
    const deleted = this.items.delete(itemId)
    if (deleted) {
      this.saveToLocalStorage()
    }
    return deleted
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values()).sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
  }

  clearCart(): void {
    this.items.clear()
    this.saveToLocalStorage()
  }

  getCartId(): string {
    return this.cartId
  }
}

// Instancia global del carrito
export const cartStorage = new CartStorage()
