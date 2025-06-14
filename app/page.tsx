import Header from "@/components/header"
import Hero from "@/components/hero"
import ProductCatalog from "@/components/product-catalog"
import Features from "@/components/features"
import Testimonials from "@/components/testimonials"
import ContactForm from "@/components/contact-form"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ProductCatalog />
      <Features />
      <Testimonials />
      <ContactForm />
      <Footer />
    </main>
  )
}
