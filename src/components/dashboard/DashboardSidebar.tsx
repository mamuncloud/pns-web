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
  X,
  ShoppingBag,
  Activity,
  Scissors,
  Users,
  Truck,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
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
  isMobileOpen = false,
  onMobileToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { isStoreOpen, isLoading, isUpdating, toggleStoreStatus } =
    useStoreSettings();

  const isMobileDrawerOpen = onMobileToggle ? isMobileOpen : isOpen;
  
  const toggleMobileDrawer = useCallback(() => {
    if (onMobileToggle) {
      onMobileToggle();
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [onMobileToggle]);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        toggleMobileDrawer();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileDrawerOpen, toggleMobileDrawer]);

  const userRole = user?.role || "CASHIER";
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-[60] lg:hidden rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-black/5 hover:bg-white hover:shadow-md dark:bg-gray-800/80 dark:border-gray-700/50 dark:hover:bg-gray-800"
        onClick={toggleMobileDrawer}
      >
        {isMobileDrawerOpen ? (
          <PanelRightClose className="h-5 w-5 text-muted-foreground" />
        ) : (
          <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {/* Mobile Sidebar Drawer (slides from right) */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white border-l border-gray-200 transition-all duration-300 ease-out lg:hidden dark:bg-gray-900 dark:border-gray-800",
          isMobileDrawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile Header with Close */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <span className="font-semibold text-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={toggleMobileDrawer}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Store Status Toggle */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
              <div className="flex flex-col">
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
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap px-3 py-2.5",
                    isActive
                      ? "bg-primary/10 text-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800",
                  )}
                  onClick={toggleMobileDrawer}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary dark:text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
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

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:inset-y-0 lg:static lg:bg-white lg:border-r lg:border-gray-200 dark:lg:bg-gray-900 dark:lg:border-gray-800",
          isCollapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center h-16 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors whitespace-nowrap",
              isCollapsed
                ? "justify-center px-6 gap-3"
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
                isCollapsed ? "hidden" : "block",
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
              isCollapsed ? "px-2 flex justify-center" : "px-6",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800",
                isCollapsed &&
                  "p-0 bg-transparent border-none justify-center",
              )}
            >
              <div className={cn("flex flex-col", isCollapsed && "hidden")}>
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
                className={cn(isCollapsed && "scale-90")}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-1",
              isCollapsed ? "px-4" : "px-4",
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
                      ? "px-3 py-2.5 justify-center"
                      : "px-3 py-2",
                    isActive
                      ? "bg-primary/10 text-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800",
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary dark:text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className={cn(isCollapsed ? "hidden" : "block")}>
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
              isCollapsed ? "p-4" : "p-4",
            )}
          >
            <div
              className={cn(
                "rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50",
                isCollapsed ? "hidden" : "block",
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
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in-0 duration-200"
          onClick={toggleMobileDrawer}
        />
      )}
    </>
  );
}
