"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync cart from API or LocalStorage based on auth
  useEffect(() => {
    if (authLoading) return;

    const fetchCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Logged in: fetch from API
          const res = await api.get("/cart");
          setCartItems(res.data.items || res.data || []);
        } else {
          // Guest: fetch from local storage
          const localCart = localStorage.getItem("naivora_cart");
          setCartItems(localCart ? JSON.parse(localCart) : []);
        }
      } catch (err) {
        console.error("Failed to load cart", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, authLoading]);

  // Persist guest cart when cartItems change (if not logged in)
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem("naivora_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user, authLoading]);

  const addToCart = async (product, quantity = 1, size = "Default") => {
    try {
      if (user) {
        const res = await api.post("/cart/add", { productId: product._id || product.id, size, quantity });
        setCartItems(res.data);
      } else {
        // Guest cart
        setCartItems((prev) => {
          const existing = prev.find(
            (item) => (item.productId?._id || item.productId?.id || item.id) === (product._id || product.id) && item.size === size
          );
          if (existing) {
             const newQty = (existing.quantity || 1) + quantity;
             if (newQty <= 0) return prev.filter((item) => item !== existing);
             
             return prev.map((item) =>
               item === existing ? { ...item, quantity: newQty } : item
             );
          } else {
             if (quantity <= 0) return prev;
             return [...prev, { productId: product, size, quantity }];
          }
        });
      }
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  const removeFromCart = async (productId, size = "Default") => {
    try {
      if (user) {
        const res = await api.delete(`/cart/remove?productId=${productId}&size=${size}`);
        setCartItems(res.data);
      } else {
        setCartItems((prev) => 
          prev.filter((item) => {
             const itemId = item.productId?._id || item.productId?.id || item.id;
             return !(itemId === productId && item.size === size);
          })
        );
      }
    } catch (err) {
      console.error("Failed to remove from cart", err);
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await api.delete("/cart/clear");
        setCartItems([]);
      } else {
        setCartItems([]);
        localStorage.removeItem("naivora_cart");
      }
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
