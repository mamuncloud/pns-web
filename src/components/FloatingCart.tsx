"use client";

import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart();
  const pathname = usePathname();

  // Hide the floating cart on the checkout pages to prevent distraction
  if (totalItems === 0 || pathname.startsWith("/checkout")) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <Link href="/checkout">
        <div className="bg-dark/90 dark:bg-primary backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center justify-between text-white border border-white/10 dark:border-primary/20 transition-transform duration-300 hover:scale-[1.02] active:scale-95 group">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 bg-white/20 dark:bg-white/20 text-white rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="absolute -top-2 -right-2 bg-primary dark:bg-zinc-950 text-white dark:text-primary text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-dark/90 dark:border-primary">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                Total Belanja
              </span>
              <span className="text-sm font-black whitespace-nowrap">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
          <div className="h-10 px-4 bg-white/20 dark:bg-white/20 rounded-xl flex items-center justify-center text-sm font-bold gap-1 group-hover:bg-white/30 transition-colors">
            Bayar <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </div>
  );
}
