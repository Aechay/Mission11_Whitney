import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem } from '../types/cartItem';

interface CartContextType {
  cart: CartItem[];
  addCartItem: (item: CartItem) => void;
  removeCartItem: (bookID: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addCartItem = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.bookID === item.bookID
      );
      const updatedCart = prevCart.map((c) =>
        c.bookID === item.bookID
          ? { ...c, quantity: c.quantity + item.quantity }
          : c
      );
      return existingItem ? updatedCart : [...prevCart, item];
    });
  };

  const removeCartItem = (bookID: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.bookID !== bookID));
  };

  const clearCart = () => {
    setCart(() => []);
  };

  return (
    <CartContext.Provider
      value={{ cart, addCartItem, removeCartItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
