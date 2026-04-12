"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function ProductOrderClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isStoreOpen } = useStoreSettings();
  
  const sortedVariants = [...product.variants].sort((a, b) => a.price - b.price);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    sortedVariants.length > 0 ? sortedVariants[0].id : null
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || sortedVariants[0];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant);
  };

  const handleDirectBuy = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant);
    router.push('/checkout');
  };

  return (
    <div className="space-y-8">
      {/* Price Display */}
      <div>
        <p className="text-sm text-on-background/60 dark:text-zinc-400 font-medium mb-1">Harga</p>
        <div className="flex items-end gap-3 transition-all duration-300">
          <span className="font-headline font-black text-4xl text-primary">
            {selectedVariant ? formatCurrency(selectedVariant.price) : "Habis"}
          </span>
          {selectedVariant?.sizeInGram && (
            <span className="text-on-background/50 dark:text-zinc-500 font-medium mb-2">
              / {formatWeight(selectedVariant.sizeInGram)}
            </span>
          )}
        </div>
      </div>

      {/* Variant Selection */}
      {sortedVariants.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-on-background dark:text-white flex justify-between items-center">
            <span>Pilih Kemasan</span>
            <span className="text-xs font-normal text-on-background/60 dark:text-zinc-400">
              {sortedVariants.length} Opsi Tersedia
            </span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sortedVariants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const isOutOfStock = variant.stock === 0;
              
              return (
                <button
                  key={variant.id}
                  onClick={() => !isOutOfStock && setSelectedVariantId(variant.id)}
                  disabled={isOutOfStock}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : isOutOfStock
                      ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-50 cursor-not-allowed"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className={`font-bold ${isSelected ? "text-primary" : "text-dark dark:text-zinc-200"}`}>
                    {variant.package}
                  </span>
                  <span className="text-xs text-on-background/60 dark:text-zinc-400 mt-1">
                    {formatCurrency(variant.price)}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-md">
                      <span className="material-symbols-outlined text-[12px] block font-bold">check</span>
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase font-bold text-center rounded-b-xl">
                      Out of Stock
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-on-background/5 dark:border-zinc-800">
        <Button 
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0 || !isStoreOpen}
          variant="outline"
          className="w-full sm:w-1/2 h-14 md:h-16 rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 font-bold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-5 w-5" />
          Masukkan Keranjang
        </Button>
        
        <Button 
          onClick={handleDirectBuy}
          disabled={!selectedVariant || selectedVariant.stock === 0 || !isStoreOpen}
          className="w-full sm:w-1/2 h-14 md:h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 text-base disabled:bg-zinc-400 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Zap className="h-5 w-5" />
          Beli Langsung
        </Button>
      </div>

      {!isStoreOpen && (
        <p className="text-center text-destructive font-bold text-sm bg-destructive/5 py-3 rounded-xl border border-destructive/10">
          Toko sedang tutup. Pemesanan sementara tidak tersedia.
        </p>
      )}
    </div>
  );
}
