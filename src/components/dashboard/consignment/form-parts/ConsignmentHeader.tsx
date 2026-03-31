"use client";

import { Calendar, User, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsignmentHeaderProps {
  date: string;
  hasSupplier: boolean;
  itemCount: number;
}

export function ConsignmentHeader({ date, hasSupplier, itemCount }: ConsignmentHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Nota Titipan Baru
        </h1>
        <p className="text-muted-foreground font-medium max-w-md leading-relaxed">
          Manajemen stok barang titipan supplier dengan pengawasan sistem terpadu.
        </p>
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center gap-4 p-2 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 border border-white dark:border-white/5 backdrop-blur-xl shadow-sm">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all",
          date ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400"
        )}>
          <Calendar className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tanggal</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all",
          hasSupplier ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400"
        )}>
          <User className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Supplier</span>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all",
          itemCount > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400"
        )}>
          <Package className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Barang: {itemCount}</span>
        </div>
      </div>
    </div>
  );
}
