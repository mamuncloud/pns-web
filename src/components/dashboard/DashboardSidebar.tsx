"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  ShoppingBag,
  Activity,
  Scissors,
  Users,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface DashboardSidebarProps {
  isCollapsed: boolean;
}

const navItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["MANAGER", "CASHIER"],
  },
  {
    name: "Pos (Kasir)",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    roles: ["MANAGER", "CASHIER"],
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    roles: ["MANAGER"],
  },
  {
    name: "Repacks",
    href: "/dashboard/repacks",
    icon: Scissors,
    roles: ["MANAGER"],
  },
  {
    name: "Stock Ledger",
    href: "/dashboard/stock",
    icon: Activity,
    roles: ["MANAGER"],
  },
  {
    name: "Purchases",
    href: "/dashboard/purchases",
    icon: ShoppingBag,
    roles: ["MANAGER"],
  },
  {
    name: "Suppliers",
    href: "/dashboard/suppliers",
    icon: Truck,
    roles: ["MANAGER"],
  },
  { name: "Staff", href: "/dashboard/staff", icon: Users, roles: ["MANAGER"] },
];

export default function DashboardSidebar({
  isCollapsed,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { isStoreOpen, isLoading, isUpdating, toggleStoreStatus } =
    useStoreSettings();

  const userRole = user?.role || "CASHIER";
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

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
          "fixed inset-y-0 left-0 z-40 transform bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 dark:bg-gray-900 dark:border-gray-800",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-64 lg:w-20" : "w-64",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center h-16 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors whitespace-nowrap",
              isCollapsed
                ? "lg:justify-center px-6 lg:px-0 gap-3 lg:gap-0"
                : "px-6 gap-3",
            )}
          >
            <div className="relative h-9 w-9 bg-white rounded-lg p-1 border border-gray-100 dark:border-gray-800 shrink-0">
              <Image
                alt="Planet Nyemil Snack Logo"
                className="object-contain"
                src="/logo.png"
                fill
                sizes="36px"
              />
            </div>
            <span
              className={cn(
                "font-headline font-black text-primary text-sm leading-[1.1] uppercase tracking-tighter",
                isCollapsed ? "lg:hidden" : "block",
              )}
            >
              Planet Nyemil
              <br />
              Snack
            </span>
          </Link>

          {/* Store Status Toggle */}
          <div
            className={cn(
              "px-4 py-4 border-b border-gray-100 dark:border-gray-800 transition-all",
              isCollapsed ? "lg:px-2 flex justify-center" : "px-6",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800",
                isCollapsed &&
                  "lg:p-0 lg:bg-transparent lg:border-none lg:justify-center",
              )}
            >
              <div className={cn("flex flex-col", isCollapsed && "lg:hidden")}>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Store Status
                </span>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    isStoreOpen ? "text-green-600" : "text-destructive",
                  )}
                >
                  {isStoreOpen ? "Open" : "Closed"}
                </span>
              </div>
              <Switch
                checked={isStoreOpen}
                disabled={isLoading || isUpdating}
                onChange={(e) => toggleStoreStatus(e.target.checked)}
                className={cn(isCollapsed && "lg:scale-90")}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-1",
              isCollapsed ? "px-4 lg:px-2" : "px-4",
            )}
          >
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isCollapsed
                      ? "px-3 py-2 lg:p-3 lg:justify-center"
                      : "px-3 py-2",
                    isActive
                      ? "bg-primary/10 text-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800",
                  )}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary dark:text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className={cn(isCollapsed ? "lg:hidden" : "block")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div
            className={cn(
              "border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2",
              isCollapsed ? "p-4 lg:p-2" : "p-4",
            )}
          >
            <div
              className={cn(
                "rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50",
                isCollapsed ? "lg:hidden block" : "block mt-2",
              )}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Support
              </p>
              <Link
                href="/dashboard/help"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Need help?
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Contact your manager for assistance.
              </p>
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
