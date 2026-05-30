import { useState } from "react";

import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import NewArrivals from "../components/home/NewArrivals";
import CategoryShowcase from "../components/home/CategoryShowcase";
import TrustSection from "../components/home/TrustSection";
import Testimonials from "../components/home/Testimonials";
import ProductQuickView from "../components/common/ProductQuickView";

function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <Hero />

      <FeaturedProducts onQuickView={setSelectedProduct} />

      <NewArrivals onQuickView={setSelectedProduct} />

      <CategoryShowcase />

      <TrustSection />

      <Testimonials />

      <section id="contact" className="container section-block">
        <div className="section-card">
          <span className="section-kicker">Make orders</span>

          <h2>Order Through WhatsApp</h2>

          <p>
            See something you like? Send the product name on WhatsApp and we’ll
            confirm availability, delivery and payment details directly.
          </p>

          <a
            className="hero-btn primary"
            href="https://wa.me/254729608929"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp: 0729608929
          </a>
        </div>
      </section>

      <ProductQuickView
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}

export default Home;