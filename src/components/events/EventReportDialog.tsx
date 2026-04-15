"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Loader2, DollarSign, ShoppingBag, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWeight } from "@/lib/utils";

interface EventReport {
  summary: {
    totalSales: number;
    orderCount: number;
  };
  items: {
    productVariantId: string;
    name: string;
    package: string;
    sizeInGram: number | null;
    allocated: number;
    sold: number;
    remaining: number;
  }[];
}

interface EventReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
}

export function EventReportDialog({ isOpen, onOpenChange, eventId, eventName }: EventReportDialogProps) {
  const [report, setReport] = useState<EventReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const response = await api.events.getReport(eventId);
      if (response.success && response.data) {
        setReport(response.data as EventReport);
      }
    } catch (error) {
      console.error("Failed to fetch event report:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchReport();
    }
  }, [isOpen, eventId, fetchReport]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-3xl border-gray-200/50 dark:border-gray-800/50">
        <DialogHeader className="p-8 pb-4 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50">
          <Badge variant="outline" className="w-fit mb-2 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest font-black text-[10px]">
            Laporan Event
          </Badge>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
            {eventName}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Memuat Laporan...</p>
            </div>
          ) : report ? (
            <>
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 shadow-sm border-2">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-green-500/10 text-green-600">
                      <DollarSign className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Pendapatan</p>
                      <p className="text-3xl font-black tracking-tight">
                        Rp {(report.summary?.totalSales ?? 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 shadow-sm border-2">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Transaksi</p>
                      <p className="text-3xl font-black tracking-tight">
                        {report.summary?.orderCount ?? 0} Transaksi
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stock Reconciliation Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Rekonsiliasi Stok Event
                </h3>
                
                <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden bg-white/50 dark:bg-gray-900/50">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50">
                      <tr className="uppercase tracking-widest text-[10px] text-muted-foreground font-black text-left">
                        <th className="px-4 py-3">Produk</th>
                        <th className="px-4 py-3 text-right text-blue-600">Alokasi Awal</th>
                        <th className="px-4 py-3 text-right text-green-600">Terjual (POS)</th>
                        <th className="px-4 py-3 text-right">Sisa (Harus Kembali)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50 font-medium">
                      {report.items.map((item) => (
                        <tr key={item.productVariantId} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                              {item.package} {item.sizeInGram ? `(${formatWeight(item.sizeInGram)})` : ""}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-blue-600">{item.allocated}</td>
                          <td className="px-4 py-3 text-right font-black text-green-600">{item.sold}</td>
                          <td className="px-4 py-3 text-right font-black">{item.remaining}</td>
                        </tr>
                      ))}
                      {report.items.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground font-medium">
                            Belum ada stok yang dialokasikan atau laporan kosong.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
