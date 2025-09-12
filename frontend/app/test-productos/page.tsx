import Link from "next/link"
import { getAllProducts } from "@/lib/products-data"

export default function TestProductsPage() {
  const products = getAllProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test de Productos - Verificar Enlaces</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">ID: {product.id}</p>
            <Link href={`/productos/${product.id}`} className="text-blue-600 hover:text-blue-800 underline">
              Ver Producto →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
