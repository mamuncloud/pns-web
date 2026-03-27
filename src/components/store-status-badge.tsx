"use client";

import { useStoreSettings } from "@/hooks/use-store-settings";
import { cn } from "@/lib/utils";

export function StoreStatusBadge() {
  const { isStoreOpen, isLoading } = useStoreSettings();

  if (isLoading) {
    return <div className="animate-pulse w-[130px] h-[34px] bg-gray-200 dark:bg-zinc-800 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className={cn("w-2.5 h-2.5 rounded-full", isStoreOpen ? "bg-[#34D399]" : "bg-red-500")} />
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Store is {isStoreOpen ? "Open" : "Closed"}
      </span>
    </div>
  );
}
