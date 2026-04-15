"use client";

import Image from "next/image";
import { Product, ProductVariant } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const tasteColors: Record<string, string> = {
  Pedas: "bg-[#C62828] text-white",
  Gurih: "bg-[#F57F17] text-white",
  Manis: "bg-[#4CAF50] text-white",
};

interface EventProductCardProps {
  product: Product;
  eventId: string;
  priority?: boolean;
}

export default function EventProductCard({
  product,
  eventId,
  priority = false,
}: EventProductCardProps) {
  const { addToCart, setEventId } = useCart();

  const handleAddToCart = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault();
    e.stopPropagation();

    setEventId(eventId);
    addToCart(product, variant, 1);
  };

  const availableVariants = product.variants.filter((v) => (v.stock ?? 0) > 0);

  if (availableVariants.length === 0) {
    return null;
  }

  return (
    <div className="group rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 flex flex-col h-full">
      <div className="relative w-full aspect-square bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900">
        <Image
          src={
            product.imageUrl ||
            "https://szaprhbdfkxrcoxuaogl.supabase.co/storage/v1/object/public/products/product_default.png"
          }
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
        />
        {product.taste.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
            {product.taste.slice(0, 2).map((t, index) => (
              <Badge
                key={`${t}-${index}`}
                className={`${tasteColors[t] || "bg-primary text-white"} font-bold rounded-lg px-2 py-0.5 shadow-md border-0 text-[10px]`}
              >
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-headline font-black text-lg text-dark dark:text-white line-clamp-1 mb-1">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-2">
          {availableVariants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-dark dark:text-zinc-100 truncate">
                  {variant.package}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Stok: {variant.stock}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-headline font-black text-lg text-primary whitespace-nowrap">
                  {variant.price.toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                  })}
                </span>
                <Button
                  className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md"
                  onClick={(e) => handleAddToCart(e, variant)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
