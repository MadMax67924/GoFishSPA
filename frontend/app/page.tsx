import Header from "@/components/layout/header"
import Hero from "@/components/sections/hero"
import ProductCatalog from "@/components/product/product-catalog"
import Features from "@/components/sections/features"
import Testimonials from "@/components/sections/testimonials"
import ContactForm from "@/components/forms/contact-form"
import Footer from "@/components/layout/footer"
import PopularProducts from '@/components/popular-products'
import { PromotionBanner } from '@/components/product/promotion-banner'

export default function Home() {
  // Configuración de promoción para mostrar en home
  const langostinosPromoEndDate = new Date();
  langostinosPromoEndDate.setDate(langostinosPromoEndDate.getDate() + 7); // 7 días desde hoy

  return (
    <main>
      <Header />
      <Hero />
      
      {/* Banner promocional después del Hero */}
      <div className="container mx-auto px-4 py-8">
        <PromotionBanner
          productName="Langostinos"
          originalPrice={29887} // Precio original real
          discountPrice={22990}  // Precio con descuento
          endDate={langostinosPromoEndDate}
          discountPercentage={23}
          productId="9" // ID para hacer el banner clickeable
        />
      </div>
      
      <ProductCatalog />
      <Features />
      <Testimonials />
      <PopularProducts />
      <ContactForm />
      <Footer />
    </main>
  )
}
