import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsapp from "../common/FloatingWhatsapp";

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />

      {children}

      <FloatingWhatsapp />

      <Footer />
    </div>
  );
}

export default Layout;