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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const navGroups = [
  {
    label: "MAIN",
    items: [
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
    ],
  },
  {
    label: "INVENTORY",
    items: [
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
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
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
      {
        name: "Staff",
        href: "/dashboard/staff",
        icon: Users,
        roles: ["MANAGER"],
      },
    ],
  },
];

export default function DashboardSidebar({
  isCollapsed,
  onToggleCollapse,
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

  // Reverting to the original theme
  const sidebarClasses =
    "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-foreground transition-all duration-300 ease-in-out flex flex-col h-full";

  return (
    <>
      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          sidebarClasses,
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col lg:hidden transition-all duration-300 ease-out",
          isMobileDrawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
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

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navGroups.map((group) => {
              const filteredItems = group.items.filter((item) =>
                item.roles.includes(userRole),
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors px-3 py-2",
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
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
            {/* Store Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Store Status
                </span>
                <span
                  className={cn(
                    "text-[11px] font-black uppercase tracking-widest",
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

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-800/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground uppercase">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="truncate text-sm font-medium text-foreground">
                  {user?.name || "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          sidebarClasses,
          "hidden lg:flex lg:sticky lg:top-0 lg:h-screen",
          isCollapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center h-16 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors whitespace-nowrap",
              isCollapsed ? "justify-center px-4" : "px-6 gap-3",
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

          {/* Navigation Links */}
          <nav
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-6",
              isCollapsed ? "px-3" : "px-4",
            )}
          >
            {navGroups.map((group) => {
              const filteredItems = group.items.filter((item) =>
                item.roles.includes(userRole),
              );

              if (filteredItems.length === 0) return null;

              return (
                <div
                  key={group.label}
                  className={cn(
                    "space-y-1",
                    isCollapsed ? "flex flex-col items-center" : "",
                  )}
                >
                  {!isCollapsed && (
                    <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {group.label}
                    </p>
                  )}
                  {isCollapsed && (
                    <div className="h-px w-8 bg-gray-200 dark:bg-gray-800 mb-2 mt-4 first:mt-0" />
                  )}

                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg text-sm font-medium transition-colors group",
                          isCollapsed
                            ? "justify-center w-10 h-10 p-0"
                            : "px-3 py-2 gap-3",
                          isActive
                            ? "bg-primary/10 text-primary dark:text-primary-foreground"
                            : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800",
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
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
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 flex flex-col mt-auto p-4 gap-2">
            {/* User Profile */}
            <div
              className={cn(
                "flex items-center rounded-xl border border-gray-200/50 bg-gray-50/50 hover:bg-gray-100/50 dark:border-gray-800/50 dark:bg-gray-800/50 dark:hover:bg-gray-800 cursor-pointer transition-colors overflow-hidden",
                isCollapsed ? "justify-center h-10 w-10 mx-auto" : "p-2 gap-3",
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground uppercase">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user?.name || "User"}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </span>
                </div>
              )}
            </div>

            {/* Store Status */}
            <div
              className={cn(
                "flex items-center rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-gray-800/50 dark:hover:bg-gray-800 cursor-pointer transition-colors overflow-hidden border border-gray-200/50 dark:border-gray-800/50",
                isCollapsed
                  ? "justify-center h-10 w-10 mx-auto"
                  : "p-2 gap-3 justify-between",
              )}
            >
              <div
                className={cn(
                  "flex flex-col overflow-hidden text-left",
                  isCollapsed && "hidden",
                )}
              >
                <span className="truncate text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Store Status
                </span>
                <span
                  className={cn(
                    "text-[11px] font-black uppercase tracking-widest",
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
                className={cn(isCollapsed && "scale-75")}
                title={isStoreOpen ? "Store is Open" : "Store is Closed"}
              />
            </div>

            {/* Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className={cn(
                "flex items-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-muted-foreground hover:text-foreground",
                isCollapsed ? "justify-center h-10 w-10 mx-auto" : "p-2 gap-3",
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
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
