import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import ProductCard from "../common/ProductCard";
import "../../styles/new-arrivals.css";

function normalizeProduct(product) {
  return {
    ...product,
    image: product.image_url,
    price: `Ksh ${product.price}`,
    newArrival: product.new_arrival,
  };
}

function NewArrivals({ onQuickView }) {
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    async function fetchArrivals() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("new_arrival", true)
        .order("created_at", { ascending: false })
        .limit(8);

      setArrivals((data || []).map(normalizeProduct));
    }

    fetchArrivals();
  }, []);

  if (!arrivals.length) return null;

  return (
    <section id="new-arrivals" className="new-arrivals-section">
      <div className="container">
        <div className="new-arrivals-header">
          <div>
            <span className="section-kicker">Fresh stock</span>
            <h2>New Arrivals</h2>
            <p>Recently added beauty picks ready for WhatsApp orders.</p>
          </div>

          <Link to="/shop" className="new-arrivals-view">
            View all
          </Link>
        </div>

        <div className="new-arrivals-scroll">
          {arrivals.map((product) => (
            <div className="arrival-card-wrapper" key={product.id}>
              <span className="arrival-label">
                {product.badge || "New Arrival"}
              </span>

              <ProductCard
                product={product}
                onQuickView={() => onQuickView(product)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;