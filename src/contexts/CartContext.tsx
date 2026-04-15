"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Product, ProductVariant } from "@/types/product";
import { toast } from "sonner";
import { getProductImageUrl } from "@/lib/utils";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  package: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sizeInGram?: number;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  eventId: string | null;
  setEventId: (eventId: string | null) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartStorage {
  items: CartItem[];
  eventId: string | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("pns_cart");
      if (saved) {
        const data: CartStorage = JSON.parse(saved);
        return data.items || [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [eventId, setEventIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("pns_cart");
      if (saved) {
        const data: CartStorage = JSON.parse(saved);
        return data.eventId || null;
      }
      return null;
    } catch {
      return null;
    }
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      const data: CartStorage = { items, eventId };
      localStorage.setItem("pns_cart", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save cart to local storage", e);
    }
  }, [items, eventId]);

  const setEventId = useCallback((id: string | null) => {
    if (id !== eventId) {
      setItems([]);
      toast.info("Keranjang dikosongkan karena Anda berpindah ke area belanja yang berbeda");
    }
    setEventIdState(id);
  }, [eventId]);

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity: number = 1) => {
    let toastMessage: string | null = null;
    let toastType: "success" | "error" = "success";

    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === variant.id);

      if (existingItem) {
        const maxStock = variant.stock ?? Infinity;
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);

        if (newQuantity === existingItem.quantity) {
          toastType = "error";
          toastMessage = `Maksimal stok ${maxStock === Infinity ? "terpenuhi" : maxStock} telah tercapai`;
          return prev;
        }

        toastMessage = `Berhasil menambahkan ${product.name} ke keranjang`;
        return prev.map((item) =>
          item.id === variant.id ? { ...item, quantity: newQuantity } : item
        );
      }

      toastMessage = `Berhasil menambahkan ${product.name} (${variant.package}) ke keranjang`;
      return [
        ...prev,
        {
          id: variant.id,
          productId: product.id,
          name: product.name,
          package: variant.package,
          price: variant.price,
          quantity: quantity,
          imageUrl: product.imageUrl || getProductImageUrl(null),
          sizeInGram: variant.sizeInGram,
          stock: variant.stock,
        },
      ];
    });

    if (toastMessage) {
      toast[toastType](toastMessage);
    }
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === variantId) {
          const maxStock = item.stock ?? Infinity;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setEventIdState(null);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        eventId,
        setEventId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
