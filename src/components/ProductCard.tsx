"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const formatRupiah = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const tasteColors = {
  Pedas: "bg-[#C62828] text-white hover:bg-[#B71C1C]",
  Gurih: "bg-[#F57F17] text-white hover:bg-[#E65100]",
  Manis: "bg-[#4CAF50] text-white hover:bg-[#388E3C]",
};

export default function ProductCard({ 
  product
}: { 
  product: Product;
}) {
  // Sort variants by price to find lowest price
  const sortedVariants = [...product.variants].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedVariants[0]?.price || 0;

  return (
    <Link href={`/products/${product.id}`} className="block h-full group focus:outline-none">
      <Card className="rounded-[2rem] overflow-hidden border border-transparent dark:border-zinc-800/50 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:border-primary/20 flex flex-col h-full bg-card p-0 gap-0 cursor-pointer">
        <div className="relative aspect-square w-full bg-muted/50 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "https://szaprhbdfkxrcoxuaogl.supabase.co/storage/v1/object/public/products/product_default.png";
            }}
          />
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.taste.map((t, index) => (
              <Badge key={`${t}-${index}`} className={`${tasteColors[t]} font-bold rounded-xl px-3 py-1 shadow-md border-0 w-fit`}>
                {t}
              </Badge>
            ))}
          </div>
        </div>
        
        <CardContent className="p-6 flex flex-col flex-grow">
          <h3 className="font-headline font-black text-xl mb-2 text-on-background dark:text-zinc-100 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-on-background/60 dark:text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
            {product.description}
          </p>

          <div className="mt-auto pt-6 border-t border-on-background/5 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-on-background/40 dark:text-zinc-500 font-bold mb-1">
                Mulai dari
              </span>
              <span className="font-headline font-black text-2xl text-primary">
                {formatRupiah(lowestPrice)}
              </span>
            </div>
            <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-full text-primary scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {product.variants.map((v, index) => (
              <span 
                key={`${v.package}-${index}`} 
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-full text-[10px] font-bold text-zinc-600 dark:text-zinc-400"
              >
                {v.package}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
