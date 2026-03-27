"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return cn(
      "font-semibold transition-colors py-1",
      pathname === path
        ? "text-primary font-bold border-b-2 border-primary"
        : "text-on-background/70 hover:text-primary"
    );
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md flex justify-between items-center px-6 md:px-12 py-4 max-w-full">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image
            alt="Planet Nyemil Snack Logo"
            className="object-contain"
            src="/logo.png"
            fill
            sizes="40px"
          />
        </div>
        <span className="font-headline font-extrabold text-primary text-lg hidden sm:block">
          Planet Nyemil Snack
        </span>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <Link className={getLinkClass("/")} href="/">
          Home
        </Link>
        <Link className={getLinkClass("/products")} href="/products">
          Product
        </Link>
        <Link className={getLinkClass("/partner")} href="/partner">
          Partner with Us
        </Link>
      </div>
      <div className="flex items-center gap-5">
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
