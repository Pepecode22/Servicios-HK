import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem('hk_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        toast.info(`"${product.nombre}" ya está en tu cotización`);
        return prev;
      }
      toast.success(`"${product.nombre}" agregado a la cotización`);
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('hk_cart');
  };

  const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
