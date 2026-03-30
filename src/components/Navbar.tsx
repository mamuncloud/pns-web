"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { StoreStatusBadge } from "@/components/store-status-badge";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 transition-all duration-300",
        isScrolled 
          ? "bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm py-3" 
          : "bg-transparent border-b border-transparent py-5"
      )}
    >
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
      </div>
    </nav>
  );
}
