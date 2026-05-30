import { useEffect, useState } from "react";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useAnalytics } from "../../context/AnalyticsContext";
import { useAuth } from "../../context/AuthContext";

function getAmount(product) {
  if (product.priceNumber) return Number(product.priceNumber);
  if (typeof product.price === "number") return product.price;
  return Number(String(product.price || "").replace(/[^\d.]/g, "")) || 0;
}

function ProductCard({ product, onQuickView }) {
  const { user } = useAuth();
  const { trackQuickView, trackShare } = useAnalytics();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  const image = product.image || product.image_url || "/vite.svg";
  const amount = getAmount(product);
  const price = product.price || `Ksh ${amount}`;
  const isAvailable = product.stock === "Available" || !product.stock;

  const productUrl = `${window.location.origin}/shop?search=${encodeURIComponent(
    product.name
  )}`;

  const shareText = `Check out ${product.name} at Tranquility Beauty 💛 — ${price}. Order via WhatsApp.`;

  useEffect(() => {
    async function checkWishlist() {
      if (!user?.email || !product?.id) return;

      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_email", user.email)
        .eq("product_id", product.id)
        .maybeSingle();

      setIsWishlisted(Boolean(data));
    }

    checkWishlist();
  }, [user?.email, product?.id]);

  function openProductModal(source) {
    trackQuickView(product.name, {
      category: product.category,
      price,
      source,
      customer_email: user?.email || null,
    });

    onQuickView?.();
  }

  async function handleWishlist() {
    if (!user?.email) {
      alert("Please login to save products to your wishlist.");
      return;
    }

    if (!product?.id || savingWishlist) return;

    setSavingWishlist(true);

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_email", user.email)
          .eq("product_id", product.id);

        if (error) throw error;

        setIsWishlisted(false);
      } else {
        const { error } = await supabase.from("wishlist").insert({
          user_email: user.email,
          product_id: product.id,
          product_name: product.name,
          product_image: image,
          product_category: product.category,
          price: amount,
        });

        if (error) throw error;

        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error.message);
      alert(error.message);
    } finally {
      setSavingWishlist(false);
    }
  }

  async function handleShare() {
    trackShare(product.name, {
      category: product.category,
      price,
      source: "product_card",
      url: productUrl,
      customer_email: user?.email || null,
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
        alert("Product link copied.");
      }
    } catch (error) {
      console.error("Share error:", error.message);
    }
  }

  return (
    <article className="product-card">
      <button
        type="button"
        className="product-image product-image-button"
        style={{ backgroundImage: `url(${image})` }}
        onClick={() => openProductModal("product_image_click")}
        aria-label={`View ${product.name}`}
      >
        <span className="product-tag">{product.badge || product.category}</span>

        {product.newArrival && (
          <span className="product-new-pill">
            <Sparkles size={13} />
            New
          </span>
        )}

        <button
          type="button"
          className={`product-wishlist-btn ${isWishlisted ? "saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist();
          }}
          disabled={savingWishlist}
          aria-label="Save to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <span className="quick-view-pill">
          <Eye size={14} />
          Quick View
        </span>
      </button>

      <div className="product-info">
        <div className="product-meta-row">
          <span>{product.category}</span>
          <span>★ {product.rating || "4.9"}</span>
        </div>

        <h3>{product.name}</h3>

        {product.description && (
          <p className="product-card-description">
            {product.description.length > 82
              ? `${product.description.slice(0, 82)}...`
              : product.description}
          </p>
        )}

        <div className="product-price-row">
          <p>{price}</p>
          <small className={isAvailable ? "product-stock" : "product-stock muted"}>
            {product.stock || "Available"}
          </small>
        </div>

        <div className="product-actions">
          <button type="button" onClick={() => openProductModal("product_card_view")}>
            <Eye size={15} />
            View
          </button>

          <button
            type="button"
            onClick={() => openProductModal("product_card_order_cta")}
            className={!isAvailable ? "disabled-order" : ""}
            disabled={!isAvailable}
          >
            <MessageCircle size={15} />
            Order
          </button>
        </div>

        <button type="button" className="product-bottom-cta" onClick={handleShare}>
          <Share2 size={15} />
          Share Product
        </button>

        <button
          type="button"
          className="product-bottom-cta"
          onClick={() => openProductModal("product_details_cta")}
        >
          <ShoppingBag size={15} />
          View Product Details
        </button>
      </div>
    </article>
  );
}

export default ProductCard;