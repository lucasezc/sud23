import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "../interfaces/product";

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  changeQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.size === size);
      if (existing) {
        return current.map((item) => item === existing
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }
      return [...current, { product, size, quantity: 1 }];
    });
  };

  const removeItem = (productId: string, size: string) => {
    setItems((current) => current.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const changeQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId, size);
      return;
    }
    setItems((current) => current.map((item) =>
      item.product.id === productId && item.size === size
        ? { ...item, quantity }
        : item,
    ));
  };

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, changeQuantity, clearCart: () => setItems([]) }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
