import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import ProductCard from "../common/ProductCard";

function normalizeProduct(product) {
  return {
    ...product,
    image: product.image_url,
    price: `Ksh ${product.price}`,
    newArrival: product.new_arrival,
  };
}

function FeaturedProducts({ onQuickView }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      setFeaturedProducts((data || []).map(normalizeProduct));
    }

    fetchFeatured();
  }, []);

  if (!featuredProducts.length) return null;

  return (
    <section id="shop" className="container section-block">
      <div className="section-card">
        <div className="section-header-row">
          <div>
            <span className="section-kicker">Best picks</span>
            <h2>Featured Products</h2>
            <p>Top beauty essentials selected for quick WhatsApp ordering.</p>
          </div>

          <Link to="/shop" className="section-view-link">
            View all
          </Link>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={() => onQuickView(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;