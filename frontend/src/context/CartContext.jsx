import { useEffect, useState } from "react";
import { CartContext } from "./cart.context";
import { useAuth } from "../hooks/useAuth";
import { getCart, replaceCart } from "../services/cart.service";

function storedCart() {
  try {
    const saved = localStorage.getItem("hello-guest-cart");
    const items = saved ? JSON.parse(saved) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    localStorage.removeItem("hello-guest-cart");
    return [];
  }
}

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [guestItems, setGuestItems] = useState(storedCart);
  const [accountItems, setAccountItems] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [syncError, setSyncError] = useState("");
  const items = isAuthenticated ? accountItems : guestItems;

  useEffect(() => {
    localStorage.setItem("hello-guest-cart", JSON.stringify(guestItems));
  }, [guestItems]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;
    let active = true;
    const localItems = storedCart();
    getCart()
      .then(async (serverItems) => {
        if (!active) return;
        const merged = new Map(serverItems.map((item) => [item.product.id, item]));
        for (const localItem of localItems) {
          const current = merged.get(localItem.product.id);
          const product = current?.product || localItem.product;
          const quantity = Math.min(product.stock, (current?.quantity || 0) + localItem.quantity);
          if (quantity > 0) merged.set(product.id, { product, quantity });
        }
        const nextItems = [...merged.values()];
        setAccountItems(nextItems);
        await replaceCart(nextItems);
        if (active) {
          setLoadedUserId(user.id);
          setGuestItems([]);
          setSyncError("");
        }
      })
      .catch((error) => {
        if (active) {
          setAccountItems(localItems);
          setLoadedUserId(user.id);
          setSyncError(error.response?.data?.message || "Your saved cart could not be loaded.");
        }
      });
    return () => { active = false; };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || loadedUserId !== user.id) return undefined;
    const timer = window.setTimeout(() => {
      replaceCart(accountItems)
        .then(() => setSyncError(""))
        .catch((error) => setSyncError(error.response?.data?.message || "Your cart could not be saved to your account."));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [accountItems, isAuthenticated, user?.id, loadedUserId]);

  const setCurrentItems = (updater) => {
    if (isAuthenticated) setAccountItems(updater);
    else setGuestItems(updater);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCurrentItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return currentItems;
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, product, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCurrentItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCurrentItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => setCurrentItems([]);
  const getCartTotal = () => items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      syncError,
      loading: isAuthenticated && loadedUserId !== user?.id,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}
