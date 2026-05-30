import { MessageCircle, Sparkles } from "lucide-react";
import { useAnalytics } from "../../context/AnalyticsContext";
import "../../styles/floating-whatsapp.css";

function FloatingWhatsApp() {
  const { trackOrder } = useAnalytics();

  const whatsappMessage =
    "Hello Tranquility Beauty 💛 I need help choosing or ordering a beauty product.";

  function handleClick() {
    trackOrder("General WhatsApp Support", {
      source: "floating_whatsapp",
      intent: "support_or_general_order",
    });
  }

  return (
    <a
      href={`https://wa.me/254729608929?text=${encodeURIComponent(
        whatsappMessage
      )}`}
      target="_blank"
      rel="noreferrer"
      className="floating-whatsapp"
      aria-label="Chat with Tranquility Beauty on WhatsApp"
      onClick={handleClick}
    >
      <span className="floating-whatsapp-pulse" />

      <div className="floating-whatsapp-icon">
        <MessageCircle size={24} />
      </div>

      <div className="floating-whatsapp-text">
        <span>
          <Sparkles size={13} />
          Beauty help
        </span>
        <strong>Order on WhatsApp</strong>
      </div>
    </a>
  );
}

export default FloatingWhatsApp;