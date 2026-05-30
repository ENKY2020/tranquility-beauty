import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Download, ExternalLink, MessageCircle, Music2 } from "lucide-react";

function Footer() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallApp() {
    if (!installPrompt) {
      alert("Install option will appear once your browser confirms the app is installable.");
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img
            src="/icons/icon-512.png"
            alt="Tranquility Beauty"
            className="footer-brand-image"
          />

          <h2>Tranquility Beauty</h2>

          <p>
            Soft beauty, cute accessories, skincare, lip care, and self-care
            essentials ordered directly through WhatsApp.
          </p>

          <strong>Payment after WhatsApp confirmation.</strong>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <a href="/#new-arrivals">New Arrivals</a>
          <a href="/#categories">Categories</a>
        </div>

        <div className="footer-column">
          <h3>Categories</h3>
          <Link to="/shop?category=Lip%20Care">Lip Care</Link>
          <Link to="/shop?category=Skincare">Skincare</Link>
          <Link to="/shop?category=Accessories">Accessories</Link>
          <Link to="/shop?category=Beauty%20Tools">Beauty Tools</Link>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>

          <a href="https://wa.me/254729608929" target="_blank" rel="noreferrer">
            <MessageCircle size={17} />
            0729608929
          </a>

          <a
            href="https://www.instagram.com/wanjaevalyn/?utm_source=ig_web_button_share_sheet"
            target="_blank"
            rel="noreferrer"
          >
            <Camera size={17} />
            Instagram
          </a>

          <a
            href="https://www.tiktok.com/@eva20235?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noreferrer"
          >
            <Music2 size={17} />
            TikTok
          </a>

          <button className="footer-install" type="button" onClick={handleInstallApp}>
            <Download size={17} />
            Install App
          </button>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Tranquility Beauty. All rights reserved.</p>

        <span>
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/evans-mugendi-126125203"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} />
            Evans Mugendi
          </a>{" "}
          • Beauty • Self-care • Confidence
        </span>
      </div>
    </footer>
  );
}

export default Footer;