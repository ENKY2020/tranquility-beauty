import { useEffect, useState } from "react";
import { heroSlides } from "../../data/heroSlides";
import "../../styles/hero.css";

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <section className="hero-section" id="home">
      <div className="hero-background-glow"></div>

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-eyebrow">{slide.badge}</span>

          <h1>{slide.title}</h1>

          <p>{slide.subtitle}</p>

          <div className="hero-actions">
            <a href="#shop" className="hero-btn primary">
              {slide.buttonText}
            </a>

            <a
              href="https://wa.me/254729608929"
              target="_blank"
              rel="noreferrer"
              className="hero-btn secondary"
            >
              Order on WhatsApp
            </a>
          </div>

          <div className="hero-phone">📞 0729608929</div>
        </div>

        <div className="hero-image-wrap">
          <img src={slide.image} alt={slide.title} className="hero-image" />

          <div className="hero-badge-card">
            <span>New</span>
            <strong>{slide.cardTitle}</strong>
            <p>{slide.cardText}</p>
          </div>
        </div>

        <div className="hero-dots">
          {heroSlides.map((item, index) => (
            <button
              key={item.id}
              className={index === activeSlide ? "active" : ""}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;