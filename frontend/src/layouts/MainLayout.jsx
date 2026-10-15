import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import WhatsAppFloat from "../components/common/WhatsAppFloat";

function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default MainLayout;
