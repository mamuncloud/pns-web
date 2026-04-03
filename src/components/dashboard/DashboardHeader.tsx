"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardHeaderProps {
  onMobileToggle?: () => void;
}

export default function DashboardHeader({
  onMobileToggle,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  // Derive page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard Overview";

    const lastSegment = segments[segments.length - 1];

    // Improved UUID check
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    if (uuidRegex.test(lastSegment)) {
      // If it's a UUID, look at the previous segment for context
      const contextSegment = segments[segments.length - 2];
      if (contextSegment) {
        // e.g. /dashboard/products/[id] -> Product Detail
        const singularName = contextSegment.endsWith("s")
          ? contextSegment.slice(0, -1)
          : contextSegment;
        return `${singularName.charAt(0).toUpperCase() + singularName.slice(1)} Detail`;
      }
      return "Record Detail";
    }

    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-10">
      {/* Title / Search */}
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Mobile Sidebar Toggle */}
        {onMobileToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={onMobileToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
        <h1 className="text-lg font-bold text-foreground sm:block truncate max-w-[140px] sm:max-w-xs md:max-w-md">
          {getPageTitle()}
        </h1>

        {/* Search removed as per user request */}
      </div>
      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
