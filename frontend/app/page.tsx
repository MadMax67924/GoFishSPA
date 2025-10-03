import Header from "@/components/layout/header"
import Hero from "@/components/sections/hero"
import ProductCatalog from "@/components/product/product-catalog"
import Features from "@/components/sections/features"
import Testimonials from "@/components/sections/testimonials"
import ContactForm from "@/components/forms/contact-form"
import Footer from "@/components/layout/footer"
import PopularProducts from '@/components/popular-products'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ProductCatalog />
      <Features />
      <Testimonials />
      <PopularProducts />
      <ContactForm />
      <Footer />
    </main>
  )
}
