import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;