import "../../styles/trust.css";
import {
  ShieldCheck,
  Sparkles,
  MessageCircleHeart,
  PackageCheck,
} from "lucide-react";


const trustItems = [
  {
    icon: <Sparkles size={34} />,
    title: "Affordable Beauty",
    text: "Cute self-care essentials and beauty products at friendly everyday prices.",
  },
  {
    icon: <MessageCircleHeart size={34} />,
    title: "Fast WhatsApp Orders",
    text: "Quick replies and smooth ordering directly through WhatsApp.",
  },
  {
    icon: <PackageCheck size={34} />,
    title: "Packed With Care",
    text: "Every order is prepared carefully to give a soft and beautiful experience.",
  },
  {
    icon: <ShieldCheck size={34} />,
    title: "Safe & Gentle Picks",
    text: "Products selected for comfort, confidence and everyday glow.",
  },
];

export default function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-container">
        <div className="trust-header">
          <span className="trust-badge">Why customers love us</span>

          <h2>
            Beauty shopping
            <br />
            made simple.
          </h2>

          <p>
            Tranquility Beauty focuses on affordable self-care, soft aesthetics
            and a smooth shopping experience for everyday beauty lovers.
          </p>
        </div>

        <div className="trust-grid">
          {trustItems.map((item, index) => (
            <div className="trust-card" key={index}>
              <div className="trust-icon">{item.icon}</div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}