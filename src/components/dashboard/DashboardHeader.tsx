"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthUser } from "@/types/financial";
import { 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface DashboardHeaderProps {
  user: AuthUser | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isStoreOpen, isLoading, isUpdating, toggleStoreStatus } = useStoreSettings();

  // Derive page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard Overview";
    
    const lastSegment = segments[segments.length - 1];
    
    // Improved UUID check
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    
    if (uuidRegex.test(lastSegment)) {
      // If it's a UUID, look at the previous segment for context
      const contextSegment = segments[segments.length - 2];
      if (contextSegment) {
        // e.g. /dashboard/products/[id] -> Product Detail
        const singularName = contextSegment.endsWith('s') 
          ? contextSegment.slice(0, -1) 
          : contextSegment;
        return `${singularName.charAt(0).toUpperCase() + singularName.slice(1)} Detail`;
      }
      return "Record Detail";
    }

    return lastSegment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10">
      {/* Title / Search */}
      <div className="flex items-center gap-8">
        <h1 className="text-lg font-bold text-foreground hidden sm:block">
          {getPageTitle()}
        </h1>
        
        {/* Search removed as per user request */}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Store Status Toggle */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            isStoreOpen ? "text-green-600" : "text-muted-foreground"
          )}>
            Open
          </span>
          <Switch 
            checked={isStoreOpen} 
            disabled={isLoading || isUpdating}
            onChange={(e) => toggleStoreStatus(e.target.checked)} 
          />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            !isStoreOpen ? "text-destructive" : "text-muted-foreground"
          )}>
            Closed
          </span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
        </Button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition-all dark:hover:bg-gray-800"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary-foreground font-bold text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-foreground leading-none">{user?.name || "Staff Member"}</p>
              <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-tighter">{user?.role || "Staff"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
          </button>

          {/* User Dropdown */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 dark:bg-gray-900 dark:border-gray-800">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-semibold truncate mt-0.5">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-800">
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-800">
                    <HelpCircle className="h-4 w-4" /> Help Center
                  </button>
                </div>

                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
