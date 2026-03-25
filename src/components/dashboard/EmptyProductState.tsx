"use client";

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface EmptyProductStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyProductState({
  title,
  description,
  actionLabel = "Tambah Produk Baru",
  actionHref = "/dashboard/products",
}: EmptyProductStateProps) {
  return (
    <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 animate-in fade-in zoom-in duration-500">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center relative">
          <Package className="h-10 w-10 text-primary" />
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-gray-950 border-2 border-primary/20 flex items-center justify-center">
            <Plus className="h-3 w-3 text-primary" />
          </div>
        </div>
        
        <div className="max-w-[300px] space-y-2">
          <h3 className="text-xl font-black text-foreground tracking-tight uppercase tracking-widest">
            {title}
          </h3>
          <p className="text-sm font-bold text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <Link href={actionHref}>
          <Button className="h-12 px-8 font-black uppercase tracking-[0.1em] shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
