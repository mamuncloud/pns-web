"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calculator,
  Handshake,
  Package,
  ChevronLeft,
  AlertTriangle,
  Scale,
  ShieldCheck,
  FileText,
  CircleAlert,
  Tag,
  Coins,
  ArrowRight,
  TrendingUp,
  Zap,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Consignment, ConsignmentItem } from "@/types/financial";

interface SettlementViewProps {
  onBack: () => void;
  onSuccess: () => void;
  consignment: Consignment;
}

interface ItemSettlementState {
  id: string;
  currentStock: number;
  qtyReturned: number;
}

export function SettlementView({ onBack, onSuccess, consignment }: SettlementViewProps) {
  const [settlementItems, setSettlementItems] = useState<ItemSettlementState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (consignment?.items) {
      setSettlementItems(
        consignment.items.map(item => ({
          id: item.id,
          currentStock: 0, // Default to 0, user must input
          qtyReturned: item.qtyReturned || 0, // Initialize with existing returns
        }))
      );
    }
  }, [consignment]);

  const updateItem = (id: string, updates: Partial<ItemSettlementState>) => {
    setSettlementItems(items => items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const getSoldCumulative = useCallback((item: ConsignmentItem) => {
    const s = settlementItems.find(si => si.id === item.id);
    if (!s) return 0;
    // Cumulative Sold: Received - (Current Stock + Returned)
    return item.qtyReceived - (s.currentStock + s.qtyReturned);
  }, [settlementItems]);

  const getSoldNow = useCallback((item: ConsignmentItem) => {
    const cumulative = getSoldCumulative(item);
    // Newly Sold: Cumulative - Previously Settled
    return cumulative - item.qtySettled;
  }, [getSoldCumulative]);

  const getInvalidReason = useCallback((item: ConsignmentItem) => {
    const s = settlementItems.find(si => si.id === item.id);
    if (!s) return null;
    
    const soldCumulative = item.qtyReceived - (s.currentStock + s.qtyReturned);
    const soldNow = soldCumulative - item.qtySettled;
    
    if (s.currentStock < 0 || s.qtyReturned < 0) return "Nilai tidak boleh negatif";
    if (soldCumulative < 0) return "Total (Sisa + Retur) melebihi jumlah awal";
    if (soldNow < 0) return "Data tidak logis (Jumlah terjual menjadi negatif)";
    if (s.qtyReturned < (item.qtyReturned || 0)) return "Jumlah retur tidak boleh dikurangi dari data sebelumnya";
    
    return null;
  }, [settlementItems]);

  const isItemInvalid = useCallback((item: ConsignmentItem) => {
    return getInvalidReason(item) !== null;
  }, [getInvalidReason]);

  const hasInvalidItems = useMemo(() => 
    consignment.items?.some(item => isItemInvalid(item)) || false
  , [consignment.items, isItemInvalid]);

  const getSubtotalNow = useCallback((item: ConsignmentItem) => {
    const soldNow = getSoldNow(item);
    return Math.max(0, soldNow) * item.unitCost;
  }, [getSoldNow]);

  const totalToPayNow = useMemo(() => 
    consignment.items?.reduce((acc, item) => acc + getSubtotalNow(item), 0) || 0
  , [consignment.items, getSubtotalNow]);

  const totalSoldNow = useMemo(() => 
    consignment.items?.reduce((acc, item) => acc + Math.max(0, getSoldNow(item)), 0) || 0
  , [consignment.items, getSoldNow]);

  const totalReturnedNowDelta = useMemo(() => {
    const currentTotal = settlementItems.reduce((acc, item) => acc + item.qtyReturned, 0);
    const previousTotal = consignment.items?.reduce((acc, item) => acc + item.qtyReturned, 0) || 0;
    return currentTotal - previousTotal;
  }, [settlementItems, consignment.items]);

  const totalItems = consignment.items?.length || 0;

  const handleSubmit = async () => {
    if (hasInvalidItems) {
      toast.error("Terdapat ketidakkonsistenan data. Periksa jumlah stok dan retur.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.consignment.settle({
        consignmentId: consignment.id,
        note,
        items: settlementItems.map(si => ({
          id: si.id,
          currentStock: si.currentStock,
          qtyReturned: si.qtyReturned,
        }))
      });
      toast.success("Protokol pelunasan berhasil difinalisasi.");
      onSuccess();
    } catch (err) {
      console.error("Failed to settle consignment", err);
      const errorResponse = err as { response?: { message?: string } };
      const message = errorResponse.response?.message || "Gagal memandalisasi protokol pelunasan.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!consignment) return (
    <div className="py-40 text-center animate-in fade-in duration-500">
      <div className="h-24 w-24 rounded-[3rem] bg-red-500/5 flex items-center justify-center text-red-500/20 mx-auto mb-8 shadow-inner">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-black uppercase italic tracking-tighter text-muted-foreground opacity-40">Kesalahan Protokol: Entitas Kosong</h3>
      <Button variant="link" onClick={onBack} className="mt-4 font-black uppercase tracking-widest text-[10px] italic text-primary">Kembali ke Katalog</Button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
           <div className="h-24 w-24 rounded-[3rem] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner group overflow-hidden relative border border-emerald-500/20">
             <Scale className="h-12 w-12 group-hover:scale-110 transition-transform duration-1000 z-10" />
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent animate-pulse" />
           </div>
           <div className="space-y-2">
             <div className="flex items-center gap-4">
                <h2 className="text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent leading-none">
                  Brankas <span className="text-emerald-500 tracking-[-0.05em]">Pelunasan</span>
                </h2>
               <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Rekonsiliasi Aktif</span>
               </div>
             </div>
             <div className="flex items-center gap-3 text-muted-foreground/40 font-black uppercase tracking-[0.4em] text-[10px] italic">
               <span className="h-1 w-16 bg-emerald-500/20 rounded-full" />
               Integritas Fiskal Protokol v7.2
             </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] italic text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10 gap-3"
          >
            <ChevronLeft className="h-4 w-4" /> Batalkan Protokol
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || totalItems === 0 || hasInvalidItems}
            className="group relative h-16 px-12 rounded-[2.5rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.25em] text-[11px] italic gap-4 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-95 overflow-hidden border-t border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <ShieldCheck className="h-5 w-5 group-hover:scale-110 transition-transform shrink-0" />
            {isSubmitting ? "Mengeksekusi Finalisasi..." : "Eksekusi Finalisasi"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Settlement Parameters & Asset Reconciliation */}
        <div className="lg:col-span-8 space-y-12">
          {/* Metadata Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-4 uppercase italic">
              <div className="h-10 w-1 bg-gradient-to-b from-emerald-500 to-transparent rounded-full opacity-50" />
              <div>
                <h3 className="text-xs font-black tracking-[0.3em] text-foreground">Parameter Protokol</h3>
                <p className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-[0.2em]">Data Registri Kontekstual</p>
              </div>
            </div>

            <Card className="border-none bg-white/40 dark:bg-white/2 backdrop-blur-3xl shadow-2xl shadow-black/5 rounded-[3rem] overflow-hidden border border-white/20 dark:border-white/5">
              <CardContent className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground ml-2">Supplier Terdaftar</Label>
                    <div className="h-16 px-6 rounded-2xl bg-gray-50/50 dark:bg-black/20 flex items-center gap-4 border border-gray-100 dark:border-white/5 shadow-inner">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                         <Handshake className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-black tracking-tight">{consignment.supplier?.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground ml-2">Catatan Pelunasan</Label>
                    <div className="relative group/input">
                       <FileText className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 group-focus-within:rotate-12 transition-all duration-500" />
                       <Input 
                        placeholder="Detail pembayaran, referensi, atau penyesuaian saldo..." 
                        className="h-16 pl-14 pr-6 rounded-2xl bg-gray-50/50 dark:bg-black/20 border-white/20 dark:border-white/5 font-black text-sm shadow-inner group-focus-within:bg-white dark:group-focus-within:bg-black/40 transition-all outline-hidden ring-0 border-none"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Item Reconciliation Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4 uppercase italic">
                <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-transparent rounded-full opacity-50" />
                <div>
                  <h3 className="text-xs font-black tracking-[0.3em] text-foreground">Rekonsiliasi Aset</h3>
                  <p className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-[0.2em]">Finalisasi Stok Real-time</p>
                </div>
              </div>
              <div className="bg-blue-500/5 px-4 py-2 rounded-xl border border-blue-500/10 backdrop-blur-sm">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none flex items-center gap-2">
                  <Package className="h-3 w-3" /> {totalItems} Total Entitas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {consignment.items?.map((item, index) => {
                const sState = settlementItems.find(si => si.id === item.id);
                const invalidReason = getInvalidReason(item);
                const isInvalid = !!invalidReason;
                return (
                  <Card key={item.id} className={cn("border-none bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl shadow-black/[0.05] border border-white/20 dark:border-white/5 group transition-all duration-700 hover:translate-y-[-4px] animate-in slide-in-from-left-4", isInvalid && "border-red-500/50 bg-red-500/[0.02] shadow-red-500/5")} style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="p-0">
                      {isInvalid && (
                        <div className="bg-red-500 text-white px-8 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                          <CircleAlert className="h-4 w-4 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">{invalidReason}</span>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row md:items-stretch h-full">
                         {/* Index Accent */}
                         <div className={cn("w-2.5 bg-emerald-500/20 group-hover:bg-emerald-500 transition-all duration-1000", isInvalid && "bg-red-500/50")} />
                         
                         <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-12 gap-10 items-end">
                            {/* Product Info */}
                            <div className="xl:col-span-5 space-y-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-[1rem] bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-[10px] shadow-inner italic border border-emerald-500/10">
                                    {String(index + 1).padStart(2, '0')}
                                  </div>
                                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Protokol SKU</Label>
                               </div>
                               <div className="space-y-1 pl-1">
                                  <h4 className="text-xl font-black tracking-tight">{item.productVariant?.product?.name}</h4>
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 italic opacity-60 flex items-center gap-2">
                                     <Tag className="h-3 w-3" /> {item.productVariant?.package}
                                  </p>
                               </div>
                             <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50/50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-inner">
                                      <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1.5">Intake Awal</p>
                                     <div className="flex items-baseline gap-1">
                                        <p className="text-lg font-black tracking-tighter">{item.qtyReceived}</p>
                                        <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-tighter">Units</span>
                                     </div>
                                  </div>
                                  <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 shadow-inner">
                                     <p className="text-[8px] font-black text-blue-600/40 uppercase tracking-widest leading-none mb-1.5 italic">Sudah Dilunasi</p>
                                     <div className="flex items-baseline gap-1">
                                        <p className="text-lg font-black tracking-tighter text-blue-600">{item.qtySettled}</p>
                                        <span className="text-[8px] font-black text-blue-600/30 uppercase tracking-tighter italic">Dibayar</span>
                                     </div>
                                  </div>
                                  <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 shadow-inner col-span-2">
                                     <p className="text-[8px] font-black text-emerald-600/40 uppercase tracking-widest leading-none mb-1.5 italic text-center">Realisasi Baru (Bayar Sekarang)</p>
                                     <div className="flex items-baseline justify-center gap-1">
                                        <p className="text-lg font-black tracking-tighter text-emerald-600">{getSoldNow(item)}</p>
                                        <span className="text-[8px] font-black text-emerald-600/30 uppercase tracking-tighter italic">Jual Baru</span>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            {/* Inputs Grid */}
                            <div className="xl:col-span-4 grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                   <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Sisa Inventaris</Label>
                                   <div className="relative group/field focus-within:-translate-y-1 transition-all duration-500">
                                     <Input 
                                       type="number"
                                       value={sState?.currentStock || 0}
                                       onChange={(e) => updateItem(item.id, { currentStock: parseInt(e.target.value) || 0 })}
                                       className={cn(
                                         "h-20 px-6 rounded-3xl bg-gray-50/50 dark:bg-black/40 border-gray-100 dark:border-white/5 font-black text-3xl shadow-inner text-center focus:ring-[1rem] transition-all appearance-none",
                                         isInvalid ? "focus:ring-red-500/10 border-red-500/20" : "focus:ring-emerald-500/10"
                                       )}
                                     />
                                     <div className={cn(
                                       "absolute inset-0 rounded-3xl border-2 pointer-events-none group-focus-within/field:border-emerald-500/20 transition-all duration-500",
                                       isInvalid ? "border-red-500/20" : "border-emerald-500/0"
                                     )} />
                                     <span className={cn(
                                       "absolute left-1/2 -translate-x-1/2 bottom-2 text-[8px] font-black uppercase tracking-[0.4em] pointer-events-none italic",
                                       isInvalid ? "text-red-500/50" : "text-emerald-600/30"
                                     )}>SISA UNIT</span>
                                   </div>
                                 </div>

                                <div className="space-y-3">
                                   <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Aset Diretur</Label>
                                   <div className="relative group/field focus-within:-translate-y-1 transition-all duration-500">
                                     <Input 
                                       type="number"
                                       value={sState?.qtyReturned || 0}
                                       onChange={(e) => updateItem(item.id, { qtyReturned: parseInt(e.target.value) || 0 })}
                                       className={cn(
                                         "h-20 px-6 rounded-3xl bg-gray-50/50 dark:bg-black/40 border-gray-100 dark:border-white/5 font-black text-3xl shadow-inner text-center focus:ring-[1rem] transition-all appearance-none",
                                         isInvalid ? "focus:ring-red-500/10 border-red-500/20" : "focus:ring-orange-500/10"
                                       )}
                                     />
                                     <div className={cn(
                                       "absolute inset-0 rounded-3xl border-2 pointer-events-none group-focus-within/field:border-orange-500/20 transition-all duration-500",
                                       isInvalid ? "border-red-500/20" : "border-orange-500/0"
                                     )} />
                                     <span className={cn(
                                       "absolute left-1/2 -translate-x-1/2 bottom-2 text-[8px] font-black uppercase tracking-[0.4em] pointer-events-none italic",
                                       isInvalid ? "text-red-500/50" : "text-orange-600/30"
                                     )}>RETUR UNIT</span>
                                   </div>
                                 </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="xl:col-span-3 space-y-4 text-right">
                               <div className="bg-gray-100/30 dark:bg-black/40 p-6 rounded-2xl border border-white/10 shadow-inner group/summary hover:bg-emerald-500/5 transition-all">
                                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                                     Pelunasan Saat Ini <Coins className="h-3 w-3" />
                                  </p>
                                  <div className="space-y-1">
                                     <p className="text-2xl font-black tracking-tighter tabular-nums group-hover/summary:scale-105 transition-transform duration-500">
                                         <span className="text-xs font-bold text-emerald-600/60 mr-1 italic">Rp</span>
                                         {getSubtotalNow(item).toLocaleString('id-ID')}
                                     </p>
                                     <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] italic">
                                         Jumlah Jatuh Tempo
                                     </p>
                                  </div>
                               </div>
                               <div className="flex items-center justify-end gap-3 px-2">
                                  <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic leading-none">Unit Netto: Rp {item.unitCost.toLocaleString('id-ID')}</p>
                                  {getSoldNow(item) > 0 && (
                                     <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none bg-emerald-600/5 dark:bg-emerald-500/[0.02] backdrop-blur-3xl rounded-[3rem] p-10 border border-emerald-500/10 relative overflow-hidden group shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] ring-1 ring-white/20 dark:ring-white/5">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-[2000ms] text-emerald-600">
               <Scale className="h-40 w-40" />
            </div>
            
            <div className="relative space-y-12">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:rotate-12 transition-transform">
                      <Calculator className="h-5 w-5 font-black" />
                   </div>
                   <div>
                     <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-600 italic">Intelijen Pelunasan</h4>
                     <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">Unit Analisis Protokol</p>
                   </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] ml-2">Total Pembayaran Protokol</p>
                  <div className="relative">
                    <div className="absolute -inset-x-4 -inset-y-2 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <p className="text-6xl font-black tracking-tighter tabular-nums antialiased relative">
                      <span className="text-xl font-black text-emerald-600/40 align-top mr-2 font-mono italic">Rp</span>
                      {totalToPayNow.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div className="p-6 bg-white/40 dark:bg-black/40 rounded-3xl border border-white/40 dark:border-white/5 shadow-inner group/stat relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30" />
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-2">Terjual Baru</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black tracking-tight leading-none text-emerald-600">{totalSoldNow}</p>
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase">UNT</span>
                      </div>
                   </div>
                   <div className="p-6 bg-white/40 dark:bg-black/40 rounded-3xl border border-white/40 dark:border-white/5 shadow-inner group/stat relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/30" />
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-2">Retur</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black tracking-tight leading-none text-orange-500">{totalReturnedNowDelta > 0 ? `+${totalReturnedNowDelta}` : totalReturnedNowDelta}</p>
                        <span className="text-[9px] font-black text-muted-foreground/30 uppercase">UNT</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      icon: Zap, 
                      title: "Rekonsiliasi Otomatis", 
                      desc: "Registri secara otomatis menghitung jumlah terjual berdasarkan delta inventaris yang diberikan.",
                      color: "text-blue-500",
                      bg: "bg-blue-500/10"
                    },
                    { 
                      icon: RefreshCw, 
                      title: "Protokol Reset Stok", 
                      desc: "Setelah finalisasi, barang yang tersisa akan dikembalikan ke brankas virtual atau diretur.",
                      color: "text-amber-500",
                      bg: "bg-amber-500/10"
                    },
                    { 
                      icon: ShieldCheck, 
                      title: "Integritas Fiskal", 
                      desc: "Finalisasi protokol ini akan menghasilkan buku besar utang definitif untuk supplier.",
                      color: "text-emerald-500",
                      bg: "bg-emerald-500/10"
                    }
                  ].map((alert, i) => (
                    <div key={i} className={cn("flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all hover:translate-x-2 cursor-default shadow-sm", alert.bg, alert.color.replace('text-', 'border-').replace('500', '500/20'))}>
                      <alert.icon className={cn("h-5 w-5 shrink-0 mt-0.5", alert.color)} />
                      <div className="space-y-1">
                         <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", alert.color)}>{alert.title}</p>
                         <p className="text-[9px] font-bold text-muted-foreground leading-relaxed opacity-60 italic">
                           {alert.desc}
                         </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || totalItems === 0}
                  className="w-full h-24 rounded-[2.5rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.25em] text-[12px] italic shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-4">
                    {isSubmitting ? "Memproses Finalisasi..." : "Finalisasi Protokol"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Protocol Operations */}
          <Card className="border-none bg-white/20 dark:bg-white/2 rounded-[2.5rem] p-10 border border-white/20 dark:border-white/5 shadow-2xl shadow-black/5">
             <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-[1.25rem] bg-gray-500/10 text-gray-400 flex items-center justify-center">
                   <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Aksi Brankas</h4>
                   <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest italic leading-none">Manajemen Protokol Eksternal</p>
                </div>
             </div>
             <div className="space-y-3">
                {[
                  { label: "Cetak Voucher Pelunasan", icon: FileText },
                  { label: "Ekspor CSV Delta Stok", icon: RefreshCw },
                  { label: "Arsip Nota Titipan", icon: ShieldCheck }
                ].map((action, i) => (
                  <Button key={i} variant="ghost" className="w-full h-14 justify-between px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/5 transition-all group/action">
                     {action.label}
                     <ArrowRight className="h-4 w-4 opacity-0 -translate-x-4 group-hover/action:opacity-100 group-hover/action:translate-x-0 transition-all text-emerald-500" />
                  </Button>
                ))}
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/5 to-transparent my-6" />
                
                <Button 
                   variant="ghost" 
                   onClick={onBack}
                   className="w-full h-14 justify-start px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all gap-4"
                >
                   <AlertTriangle className="h-4 w-4" /> Abaikan Sesi Protokol
                </Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
