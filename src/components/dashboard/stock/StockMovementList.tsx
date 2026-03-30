"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StockMovement } from "@/types/financial";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  PackageSearch,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StockMovementListProps {
  productVariantId?: string;
  productId?: string;
  limit?: number;
  className?: string;
  refreshKey?: number;
}

export function StockMovementList({ productVariantId, productId, limit = 50, className, refreshKey = 0 }: StockMovementListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMovements() {
      try {
        setIsLoading(true);
        const { data } = await api.stock.movements({ productVariantId, productId, limit });
        setMovements(data);
      } catch (error) {
        console.error("Failed to fetch stock movements:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovements();
  }, [productVariantId, productId, limit, refreshKey]);

  const getMovementBadge = (type: string, quantity: number) => {
    const isPositive = quantity > 0;
    
    // Define exact styles for known types
    let colorClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    
    if (type === 'PURCHASE' || type === 'REPACK_TARGET' || type === 'RETURN' || (type === 'ADJUSTMENT' && isPositive)) {
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    } else if (type === 'SALE' || type === 'REPACK_SOURCE' || type === 'PURCHASE_REVERSAL' || (type === 'ADJUSTMENT' && !isPositive)) {
      colorClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    }

    return (
      <Badge variant="outline" className={cn("font-black tracking-widest text-[9px] uppercase shadow-sm border", colorClass)}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl animate-pulse">
        <Activity className="h-8 w-8 text-muted-foreground/30 mb-4 animate-spin-slow" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Memuat Riwayat Stok</p>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/20">
        <div className="h-16 w-16 bg-white dark:bg-gray-950 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <PackageSearch className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Belum ada riwayat pergerakan</p>
        <p className="text-xs font-medium text-muted-foreground/60 mt-1 max-w-sm text-center">Riwayat stok akan muncul otomatis setiap kali ada pembelian, penjualan, atau repackaging.</p>
      </div>
    );
  }

  return (
    <Card className={cn("border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl", className)}>
      <div className="p-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Log Aktivitas Stok</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mt-1">Sistem pencatatan otomatis & real-time</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/30 dark:bg-gray-900/30 hover:bg-transparent border-gray-100/50 dark:border-gray-800/50">
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 whitespace-nowrap">Tanggal & Waktu</TableHead>
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Tipe Pergerakan</TableHead>
              {!productVariantId && (
                <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Produk Varian</TableHead>
              )}
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 text-right">Perubahan (Delta)</TableHead>
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 text-right">Saldo Akhir</TableHead>
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Pengguna</TableHead>
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Referensi / Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {movements.map((movement) => {
              const date = new Date(movement.createdAt);
              const isPositive = movement.quantity > 0;

              return (
                <TableRow key={movement.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground">
                        {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)}
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                        {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getMovementBadge(movement.type, movement.quantity)}
                  </TableCell>

                  {!productVariantId && (
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {movement.productVariant?.product?.name || 'Unknown Product'}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] mt-0.5 flex items-center gap-1.5">
                          SKU ID: {movement.productVariant?.package || '???'}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2 w-full">
                      <span className={cn(
                        "text-lg font-black tracking-tighter",
                        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {isPositive ? '+' : ''}{movement.quantity}
                      </span>
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center shadow-sm",
                        isPositive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                      )}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="text-base font-black text-foreground">
                      {movement.balanceAfter} <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest ml-1">pcs</span>
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-foreground">
                         {movement.user?.name || 'Sistem'}
                       </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 max-w-[200px]">
                    <div className="flex flex-col">
                       {movement.referenceId && (
                         <span className="text-[10px] font-mono text-muted-foreground/60 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded w-fit mb-1 border border-gray-200 dark:border-gray-700">
                           ref: {movement.referenceId.slice(0, 8)}
                         </span>
                       )}
                       {movement.note ? (
                         <span className="text-xs text-muted-foreground truncate" title={movement.note}>
                           {movement.note}
                         </span>
                       ) : (
                         <span className="text-[10px] italic text-muted-foreground/40">-</span>
                       )}
                    </div>
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
