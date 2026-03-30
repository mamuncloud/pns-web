"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Toaster } from "@/components/ui/sonner";
import { useActivityRefresh } from "@/hooks/use-activity-refresh";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useActivityRefresh();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !isEmployee) {
        router.push("/staff");
        return;
      }

      // Route Authorization
      const userRole = user?.role || "CASHIER";
      
      // If user is a CASHIER, restrict their access to specific allowed paths only
      if (userRole === "CASHIER") {
        const allowedPaths = ["/dashboard", "/dashboard/pos"];
        // Allow exact matches or sub-paths like /dashboard/pos/...
        const isAllowed = allowedPaths.some(
          allowed => pathname === allowed || pathname.startsWith(`${allowed}/`)
        );
        
        if (!isAllowed) {
          router.push("/dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, isEmployee, router, pathname, user]);

  if (isLoading || !isAuthenticated || !isEmployee) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Toaster />
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <DashboardHeader user={user} />

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
