"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Menu,
  X,
  ShoppingBag,
  Activity,
  Scissors
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pos (Kasir)", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Purchases", href: "/dashboard/purchases", icon: ShoppingBag },
  { name: "Repacks", href: "/dashboard/repacks", icon: Scissors },
  { name: "Stock Ledger", href: "/dashboard/stock", icon: Activity },
  { name: "Logs", href: "/dashboard/logs", icon: Activity },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 dark:bg-gray-900 dark:border-gray-800",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="relative h-9 w-9 bg-white rounded-lg p-1 border border-gray-100 dark:border-gray-800">
              <Image
                alt="Planet Nyemil Snack Logo"
                className="object-contain"
                src="/logo.png"
                fill
                sizes="36px"
              />
            </div>
            <span className="font-headline font-black text-primary text-sm leading-[1.1] uppercase tracking-tighter">
              Planet Nyemil
              <br />
              Snack
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Support</p>
              <Link
                href="/dashboard/help"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Need help?
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Contact your manager for assistance.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
