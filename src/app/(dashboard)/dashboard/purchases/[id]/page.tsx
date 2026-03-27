"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Purchase } from "@/types/financial";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  User, 
  Package, 
  Receipt,
  FileText,
  TrendingUp,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const response = await api.purchases.get(id);
        if (response.success) {
          setPurchase(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch purchase details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-950 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Memuat Detail Pembelian...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-950 gap-6">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
          <FileText className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Purchase Not Found</h2>
          <p className="text-muted-foreground text-sm">The purchase record you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/purchases")} variant="outline" className="rounded-xl px-8 font-bold">
          Back to History
        </Button>
      </div>
    );
  }

  const formatCurrency = (amt: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Button 
            onClick={() => router.push("/dashboard/purchases")} 
            variant="ghost" 
            className="group -ml-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg pl-2 pr-4 font-black text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Detail Pembelian</h2>
              <Badge 
                variant="outline"
                className={cn(
                  "font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-xl border-2 transition-all shadow-sm",
                  purchase.status === 'COMPLETED' 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5" 
                    : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-indigo-500/5"
                )}
              >
                {purchase.status === 'COMPLETED' ? 'CONFIRMED' : 'DRAFT'}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              ID: <span className="font-black text-xs text-foreground/70 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded leading-none">{purchase.id.split('-').pop()}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 mx-1" />
              Dibuat pada {format(new Date(purchase.createdAt), "dd MMMM yyyy, HH:mm", { locale: localeId })} WIB
            </p>
          </div>
        </div>

        <Card className="border-none bg-primary/5 dark:bg-primary/950/20 p-6 flex flex-col items-end gap-1 rounded-3xl backdrop-blur-sm">
          <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Total Pembelian</span>
          <span className="text-3xl font-black text-primary tracking-tighter">
            {formatCurrency(purchase.totalAmount)}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-950/50 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                Informasi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-primary shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Supplier</p>
                    <p className="text-sm font-black text-foreground">{purchase.supplier?.name || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-primary shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Tanggal Invoice</p>
                    <p className="text-sm font-black text-foreground">
                      {format(new Date(purchase.date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-primary shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Catatan</p>
                    <p className="text-sm font-bold text-muted-foreground italic leading-relaxed">
                      {purchase.note || "Tidak ada catatan."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 space-y-3 shadow-lg shadow-indigo-900/5 relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Receipt className="h-24 w-24" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="h-4 w-4" /> Summary Analitik
             </p>
             <div className="space-y-4 relative z-10 pt-2">
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold opacity-70">Total Item</span>
                  <span className="text-xs font-black">{purchase.items?.length || 0} Produk</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold opacity-70">Unit Terbanyak</span>
                  <span className="text-xs font-black">
                    {purchase.items?.reduce((prev, curr) => (prev.qty > curr.qty ? prev : curr)).product?.name || "N/A"}
                  </span>
               </div>
             </div>
          </div>
        </div>

        {/* Items Table Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white/60 dark:bg-gray-950/50 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-8 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                <Package className="h-3.5 w-3.5 text-primary" />
                Daftar Barang yang Dibeli
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/30 dark:bg-gray-900/30">
                  <TableRow className="hover:bg-transparent border-b-0">
                    <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 py-4">Produk</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Qty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">HPP Satuan</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Harga Jual</TableHead>
                    <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items?.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-white dark:hover:bg-gray-900 transition-all duration-300">
                      <TableCell className="pl-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{item.product?.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="px-1.5 py-0 text-[8px] font-black uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 text-muted-foreground border-none">
                              {item.variantLabel}
                            </Badge>
                            {item.expiredDate && (
                              <span className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                                <TrendingUp className="h-2.5 w-2.5 rotate-180" /> EXP: {format(new Date(item.expiredDate), "dd/MM/yy")}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-sm">
                        {item.qty}
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.unitCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(item.sellingPrice)}</span>
                           <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">Margin: {Math.round(((item.sellingPrice - item.unitCost) / item.sellingPrice) * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <span className="text-sm font-black text-foreground">
                          {formatCurrency(item.totalCost + item.extraCosts)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-8 bg-gray-50/30 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                     <Tag className="h-3 w-3 text-primary opacity-50" />
                     <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Metode Perhitungan</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground italic max-w-xs">HPP Item dihitung menggunakan Weighted Average berdasarkan total cost + extra costs.</p>
               </div>
               <div className="flex items-baseline gap-4">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(purchase.totalAmount)}</span>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
