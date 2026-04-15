"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/financial";
import { 
  RotateCcw, 
  Package, 
  Box, 
  ArrowDownLeft, 
  ArrowUpRight,
  Loader2,
  PackageOpen
} from "lucide-react";
import { AllocateStockDialog } from "./AllocateStockDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EventStockManagerProps {
  event: Event;
  onRefresh: () => void;
}

export function EventStockManager({ event, onRefresh }: EventStockManagerProps) {
  const [isReturning, setIsReturning] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const handleReturnAll = async () => {
    setIsReturning(true);
    try {
      await api.events.returnStock(event.id, {}); // Empty array/object = all
      toast.success("Semua stok berhasil dikembalikan ke gudang utama");
      setIsReturnDialogOpen(false);
      onRefresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mengembalikan stok";
      toast.error(message);
    } finally {
      setIsReturning(false);
    }
  };

  const hasItems = event.items && event.items.length > 0;

  return (
    <div className="grid gap-8">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Manajemen Stok Event</h3>
            <p className="text-xs text-muted-foreground font-medium">Alokasikan produk atau kembalikan sisa sisa penjualan.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasItems && (
            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-5" />
                }
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Kembalikan Bulky
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase italic">Konfirmasi Pengembalian</DialogTitle>
                  <DialogDescription className="font-medium">
                    Tindakan ini akan memindahkan SELURUH sisa stok di event ini kembali ke gudang utama. Pastikan perhitungan fisik sudah sesuai.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="ghost" onClick={() => setIsReturnDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReturnAll}
                    disabled={isReturning}
                    className="rounded-xl font-bold px-8 shadow-lg shadow-rose-200"
                  >
                    {isReturning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya, Kembalikan Semua"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <AllocateStockDialog event={event} onSuccess={onRefresh} />
        </div>
      </div>

      {/* Stock Table */}
      <Card className="rounded-3xl border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <PackageOpen className="h-4 w-4" />
              Daftar Produk di Event
            </CardTitle>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {event.items?.length || 0} Ragam Produk
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <Box className="h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-sm font-black uppercase tracking-widest">Gudang Event Kosong</p>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-1">Silakan alokasikan stok untuk memulai.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800/50">
                  <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 pl-6">Produk & Varian</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-wider h-12">Stok Sekarang</TableHead>
                  <TableHead className="text-center text-[10px] font-black uppercase tracking-wider h-12">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-wider h-12 pr-6">Info Transaksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.items?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{item.productVariant?.product?.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary mt-0.5">{item.productVariant?.package}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xl font-black tracking-tight text-foreground leading-none">{item.stock}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1">PCS</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                       {item.stock > 0 ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-tighter border border-green-100">
                           <ArrowDownLeft className="h-3 w-3" /> Ready
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-tighter border border-rose-100">
                           <ArrowUpRight className="h-3 w-3" /> Sold Out
                         </div>
                       )}
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6 space-y-1">
                      <div className="text-[10px] font-medium text-muted-foreground italic">
                        Stok khusus terpisah dari gudang pusat.
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
