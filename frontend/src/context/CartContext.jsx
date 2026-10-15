import {
  createContext,
  useEffect,
  useState,
} from "react";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved =
        localStorage.getItem("hello-cart");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "hello-cart",
      JSON.stringify(items)
    );
  }, [items]);

  const addToCart = (product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          product,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.product.id !== productId
      )
    );
  };

  const updateQuantity = (
    productId,
    quantity
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce(
      (total, item) =>
        total +
        (item.product.discountPrice ??
          item.product.price) *
          item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}