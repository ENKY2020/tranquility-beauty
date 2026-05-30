import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "../common/FloatingWhatsApp";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />

      {children}

      <FloatingWhatsApp />

      <Footer />
    </div>
  );
}

export default Layout;