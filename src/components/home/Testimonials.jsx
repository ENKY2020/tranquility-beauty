import { useEffect, useMemo, useState } from "react";
import "../../styles/testimonials.css";

const testimonials = [
  {
    name: "Shiku",
    location: "Nairobi",
    product: "Watermelon Lip Oil",
    review:
      "Ile lip oil ni soft sana. Sio sticky, na inakaa cute kwa handbag. Delivery pia ilikuwa fast.",
    rating: 5,
  },
  {
    name: "Achieng",
    location: "Kasarani",
    product: "Cute Scrunchies",
    review:
      "Scrunchies ni zile za soft girl kabisa. Quality iko sawa na colours ni pretty sana.",
    rating: 5,
  },
  {
    name: "Wanjiku",
    location: "Thika Road",
    product: "Avocado Face Mask",
    review:
      "Nilipenda vile order ilihandle-liwa WhatsApp. Fast reply, clear price, no stress.",
    rating: 5,
  },
  {
    name: "Brenda",
    location: "Roysambu",
    product: "Keyholder",
    review:
      "Cute finds za bei poa. Nilichukua keyholder na lip gloss, honestly worth it.",
    rating: 5,
  },
  {
    name: "Faith",
    location: "Kahawa West",
    product: "Beauty Sponge",
    review:
      "Packaging ilikuwa neat na product ilifika ikiwa sawa. Hii shop iko na vibe.",
    rating: 5,
  },
];

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTestimonial = testimonials[activeIndex];

  const visibleTestimonials = useMemo(() => {
    return [
      activeTestimonial,
      testimonials[(activeIndex + 1) % testimonials.length],
      testimonials[(activeIndex + 2) % testimonials.length],
    ];
  }, [activeIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonials-section">
      <div className="container testimonials-inner">
        <div className="testimonials-header">
          <span className="section-kicker">Customer love</span>

          <h2>What our customers say</h2>

          <p>
            Real beauty finds, soft self-care vibes and quick WhatsApp ordering
            — simple, pretty and stress-free.
          </p>
        </div>

        <div className="testimonials-grid">
          {visibleTestimonials.map((item, index) => (
            <article className="testimonial-card" key={`${item.name}-${index}`}>
              <div className="testimonial-top">
                <div className="testimonial-avatar">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h3>{item.name}</h3>
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="testimonial-stars">
                {"★".repeat(item.rating)}
              </div>

              <p className="testimonial-review">“{item.review}”</p>

              <div className="testimonial-product">
                Bought: <strong>{item.product}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;