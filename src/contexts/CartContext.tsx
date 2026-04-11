"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, ProductVariant } from "@/types/product";
import { toast } from "sonner";
import { getProductImageUrl } from "@/lib/utils";

export interface CartItem {
  id: string; // use variant id as cart item id
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
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("pns_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("pns_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === variant.id);
      
      if (existingItem) {
        // Ensure we don't exceed stock
        const maxStock = variant.stock ?? Infinity;
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
        
        if (newQuantity === existingItem.quantity) {
          toast.error(`Maksimal stok ${maxStock} telah tercapai`);
          return prev;
        }

        toast.success(`Berhasil menambahkan ${product.name} ke keranjang`);
        return prev.map((item) =>
          item.id === variant.id ? { ...item, quantity: newQuantity } : item
        );
      }

      toast.success(`Berhasil menambahkan ${product.name} ke keranjang`);
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
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
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
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
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
