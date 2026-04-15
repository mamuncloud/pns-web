"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

interface EventNavbarProps {
  eventId: string;
  eventName: string;
  eventType: string;
}

export default function EventNavbar({ eventId }: EventNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { setEventId } = useCart();

  useEffect(() => {
    if (pathname.startsWith("/events/")) {
      const match = pathname.match(/^\/events\/([^/]+)/);
      if (match) {
        const urlEventId = match[1];
        if (urlEventId !== eventId) {
          setEventId(urlEventId);
        }
      }
    }
  }, [pathname, eventId, setEventId]);

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
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm py-3"
          : "bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-b border-zinc-200/30 dark:border-zinc-800/30 py-4",
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="relative h-10 w-10">
          <Image
            alt="Planet Nyemil Snack Logo"
            className="object-contain"
            src="/logo.png"
            fill
            sizes="40px"
            loading="eager"
          />
        </div>
        <span className="font-headline font-extrabold text-primary dark:text-white text-lg hidden sm:block">
          Planet Nyemil Snack
        </span>
      </Link>
    </nav>
  );
}
