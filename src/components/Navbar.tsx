"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { StoreStatusBadge } from "@/components/store-status-badge";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-transparent dark:border-zinc-800/60 flex justify-between items-center px-6 md:px-12 py-4 max-w-full">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="relative h-10 w-10">
          <Image
            alt="Planet Nyemil Snack Logo"
            className="object-contain"
            src="/logo.png"
            fill
            sizes="40px"
          />
        </div>
        <span className="font-headline font-extrabold text-primary dark:text-white text-lg hidden sm:block">
          Planet Nyemil Snack
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <StoreStatusBadge />
        <ThemeToggle />
        {/* <button className="text-on-background/70 hover:text-primary transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
        <button className="text-on-background/70 hover:text-primary transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">account_circle</span>
        </button> */}
      </div>
    </nav>
  );
}
