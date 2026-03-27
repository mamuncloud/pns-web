"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex flex-wrap items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50", className)}>
      <Link 
        href="/dashboard" 
        className="flex items-center gap-1.5 hover:text-primary transition-colors hover:scale-105 active:scale-95"
      >
        <Home className="h-3 w-3" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
          <ChevronRight className="h-3 w-3 opacity-30" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href}
              className="hover:text-primary transition-colors hover:scale-105 active:scale-95"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground/80 truncate max-w-[150px] sm:max-w-none italic">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
