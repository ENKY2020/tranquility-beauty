import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import { useAnalytics } from "../../context/AnalyticsContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/product-modal.css";

function getAmount(product) {
  if (product.priceNumber) return Number(product.priceNumber);

  if (typeof product.price === "number") {
    return product.price;
  }

  return Number(
    String(product.price || "").replace(/[^\d.]/g, "")
  ) || 0;
}

function ProductQuickView({ product, onClose }) {
  const { user } = useAuth();
  const { trackOrder } = useAnalytics();

  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [customerName, setCustomerName] = useState(
    user?.user_metadata?.full_name || ""
  );

  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const images = useMemo(() => {
    if (!product) return [];

    const productImages = product.images?.length
      ? product.images
      : product.image_urls?.length
      ? product.image_urls
      : [product.image || product.image_url];

    return productImages.filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (images.length) {
      setActiveImage(images[0]);
    }
  }, [images]);

  if (!product) return null;

  const amount = getAmount(product);

  const total = amount * quantity;

  const productPrice =
    typeof product.price === "number"
      ? `Ksh ${product.price}`
      : product.price || `Ksh ${amount}`;

  const isAvailable =
    product.stock === "Available" || !product.stock;

  async function handleWhatsappOrder() {
    if (!isAvailable || isSubmitting) return;

    setIsSubmitting(true);

    try {
      trackOrder(product.name, {
        category: product.category,
        quantity,
        total,
        customer_email: user?.email || null,
        source: "quick_view_checkout",
      });

      const orderPayload = {
        product_id: product.id || null,
        product_name: product.name,
        product_image:
          activeImage || product.image || product.image_url,

        product_category: product.category,

        customer_name:
          customerName ||
          user?.user_metadata?.full_name ||
          "Customer",

        customer_email: user?.email || null,

        customer_phone: customerPhone || null,

        delivery_location: deliveryLocation || null,

        quantity,

        amount: total,

        order_status: "pending",

        payment_status: "not_paid",

        delivery_status: "not_started",

        source: "quick_view_checkout",

        notes:
          customerNote ||
          "Customer started WhatsApp checkout flow.",
      };

      const { error } = await supabase
        .from("orders")
        .insert(orderPayload);

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      const whatsappMessage = `
Hello Tranquility Beauty 💛

I would like to order:

🛍 Product: ${product.name}
📦 Quantity: ${quantity}
💰 Total: Ksh ${total}

👤 Customer: ${customerName || "Customer"}
📞 Phone: ${customerPhone || "Not provided"}
📍 Location: ${deliveryLocation || "Not provided"}

📝 Note:
${customerNote || "No additional note"}

Is this available?
      `;

      window.open(
        `https://wa.me/254729608929?text=${encodeURIComponent(
          whatsappMessage
        )}`,
        "_blank",
        "noopener,noreferrer"
      );

      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <section
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="product-modal-gallery">
          <div className="product-modal-image">
            <img
              src={activeImage || "/vite.svg"}
              alt={product.name}
            />

            {product.badge && (
              <span className="modal-floating-badge">
                {product.badge}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="modal-thumbnail-row">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={
                    activeImage === image ? "active" : ""
                  }
                  onClick={() => setActiveImage(image)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-modal-content">
          <div className="modal-badge-row">
            {product.category && (
              <span className="product-category-badge">
                {product.category}
              </span>
            )}

            {product.newArrival && (
              <span className="product-badge">
                <Sparkles size={13} />
                New Arrival
              </span>
            )}
          </div>

          <h2>{product.name}</h2>

          <div className="modal-product-meta">
            <span>★ {product.rating || "4.9"}</span>

            <span
              className={
                isAvailable ? "in-stock" : "low-stock"
              }
            >
              {product.stock || "Available"}
            </span>
          </div>

          <p className="product-price">
            {productPrice}
          </p>

          <p className="product-description">
            {product.description ||
              "A beautiful pick from Tranquility Beauty."}
          </p>

          <div className="modal-trust-grid">
            <span>
              <BadgeCheck size={16} />
              Quality checked
            </span>

            <span>
              <Truck size={16} />
              WhatsApp delivery support
            </span>

            <span>
              <ShieldCheck size={16} />
              Confirm before payment
            </span>

            <span>
              <Heart size={16} />
              Beauty essential
            </span>
          </div>

          <div className="commerce-checkout-box">
            <h3>
              <ShoppingBag size={18} />
              Quick Checkout
            </h3>

            <div className="checkout-grid">
              <div className="checkout-field">
                <label>
                  <User size={14} />
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                />
              </div>

              <div className="checkout-field">
                <label>
                  <Phone size={14} />
                  Phone
                </label>

                <input
                  type="text"
                  placeholder="07XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(e.target.value)
                  }
                />
              </div>

              <div className="checkout-field full-width">
                <label>
                  <MapPin size={14} />
                  Delivery Location
                </label>

                <input
                  type="text"
                  placeholder="Town / estate / pickup location"
                  value={deliveryLocation}
                  onChange={(e) =>
                    setDeliveryLocation(e.target.value)
                  }
                />
              </div>

              <div className="checkout-field">
                <label>Quantity</label>

                <select
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <option key={qty} value={qty}>
                      {qty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="checkout-field">
                <label>Total</label>

                <div className="checkout-total">
                  Ksh {total}
                </div>
              </div>

              <div className="checkout-field full-width">
                <label>Note</label>

                <textarea
                  rows="3"
                  placeholder="Color, variation, delivery timing..."
                  value={customerNote}
                  onChange={(e) =>
                    setCustomerNote(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="product-modal-actions">
            <button
              type="button"
              className={
                isAvailable
                  ? "modal-whatsapp-btn"
                  : "modal-whatsapp-btn disabled"
              }
              onClick={handleWhatsappOrder}
            >
              <MessageCircle size={17} />

              {isSubmitting
                ? "Creating Order..."
                : "Continue to WhatsApp"}
            </button>

            <button
              className="modal-secondary-btn"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>

          <p className="modal-helper-note">
            Your order will be recorded before WhatsApp
            confirmation so Tranquility Beauty can assist
            you faster.
          </p>
        </div>
      </section>
    </div>
  );
}

export default ProductQuickView;