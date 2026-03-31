"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calculator,
  Handshake,
  Check,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Consignment } from "@/types/financial";

interface ConsignmentItem {
  id: string;
  name: string;
  received: number;
  returned: number;
  currentStock: number;
  unitCost: number;
}

interface SettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  consignment: Consignment;
}

export function SettlementDialog({ isOpen, onClose, consignment }: SettlementDialogProps) {
  const [items] = useState<ConsignmentItem[]>([
    { id: "1", name: "Keripik Singkong 250gr", received: 50, returned: 0, currentStock: 20, unitCost: 15000 },
    { id: "2", name: "Basreng Pedas 100gr", received: 30, returned: 5, currentStock: 10, unitCost: 12000 },
  ]);

  const calculateSold = (item: ConsignmentItem) => {
    return item.received - item.returned - item.currentStock;
  };

  const calculateSubtotal = (item: ConsignmentItem) => {
    return calculateSold(item) * item.unitCost;
  };

  const totalToPay = items.reduce((acc, item) => acc + calculateSubtotal(item), 0);

  if (!consignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 gap-0 bg-white dark:bg-gray-950">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-amber-500/5 dark:bg-amber-500/10">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">Penyelesaian Konsinyasi</DialogTitle>
                <DialogDescription className="font-bold">Hitung rekonsiliasi barang laku untuk Supplier: {consignment.supplier?.name || consignment.supplierId}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed uppercase tracking-tight">
              Sistem akan menghitung otomatis: <span className="text-amber-600 underline">(Barang Masuk - Barang Kembali - Stok Saat Ini) = Barang Terjual</span>. 
              Pastikan stok fisik sesuai dengan data sistem sebelum melakukan settlement.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const sold = calculateSold(item);
              return (
                <Card key={item.id} className="border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-900/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-50">Produk</p>
                        <p className="text-sm font-black tracking-tight">{item.name}</p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Masuk</p>
                          <p className="text-sm font-black">{item.received}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Aktual</p>
                          <p className="text-sm font-black text-primary">{item.currentStock}</p>
                        </div>
                        <div className="text-center bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                          <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Terjual</p>
                          <p className="text-sm font-black text-emerald-600">{sold}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Subtotal (HPP)</p>
                          <p className="text-sm font-black">Rp {calculateSubtotal(item).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1">Total Dibayar ke Supplier</p>
                <p className="text-3xl font-black tracking-tighter text-emerald-600 flex items-baseline gap-2 italic">
                  <span className="text-sm not-italic">Rp</span>
                  {totalToPay.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Batal (Review Lagi)</Button>
              <Button className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs italic gap-3 shadow-xl shadow-emerald-600/20">
                <Check className="h-5 w-5" /> Bayar & Selesaikan
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
