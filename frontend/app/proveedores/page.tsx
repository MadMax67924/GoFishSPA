import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ProviderForm from "@/components/forms/provider-form"

export const metadata = {
  title: "Nuevos Proveedores | GoFish SpA",
  description: "Formulario de registro para proveedores externos",
}

export default function ProveedoresPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-[#005f73]">
            Registro de Nuevos Proveedores
          </h1>
          <ProviderForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
