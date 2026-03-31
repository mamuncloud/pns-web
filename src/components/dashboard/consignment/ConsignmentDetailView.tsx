"use client";

import { 
  Package, 
  ChevronLeft,
  Calendar,
  Handshake,
  Tag,
  ArrowRight,
  ShieldCheck,
  Box,
  Truck,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Consignment } from "@/types/financial";

interface ConsignmentDetailViewProps {
  consignment: Consignment;
  onBack: () => void;
  onSettle: () => void;
}

export function ConsignmentDetailView({ 
  consignment, 
  onBack,
  onSettle 
}: ConsignmentDetailViewProps) {
  if (!consignment) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
           <div className="h-24 w-24 rounded-[3.5rem] bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-inner group overflow-hidden relative border border-indigo-500/20">
             <Box className="h-12 w-12 group-hover:scale-110 transition-transform duration-1000 z-10" />
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent animate-pulse" />
           </div>
           <div className="space-y-2">
             <div className="flex items-center gap-4">
                <h2 className="text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent leading-none">
                  Manifest <span className="text-indigo-500 tracking-[-0.05em]">Lengkap</span>
                </h2>
               <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Terdaftar di Registri</span>
               </div>
             </div>
             <div className="flex items-center gap-3 text-muted-foreground/30 font-black uppercase tracking-[0.4em] text-[10px] italic">
               <span className="h-1 w-20 bg-indigo-500/20 rounded-full" />
               Protocol ID: {consignment.id.toUpperCase()}
             </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="h-16 px-10 rounded-[2.5rem] font-black uppercase tracking-[0.25em] text-[10px] italic text-muted-foreground/40 hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-white/10 gap-4"
          >
            <ChevronLeft className="h-4 w-4" /> Kembali ke Katalog
          </Button>
          <Button 
            onClick={onSettle}
            disabled={consignment.status === 'CLOSED'}
            className="group relative h-16 px-12 rounded-[2.5rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.25em] text-[11px] italic gap-5 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-95 overflow-hidden border-t border-white/20 disabled:opacity-50 disabled:grayscale"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <ShieldCheck className="h-5 w-5" /> Inisiasi Kalkulasi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-12">
          {/* Main Item List */}
          <div className="bg-white/40 dark:bg-black/20 rounded-[4rem] border border-white/40 dark:border-white/5 shadow-2xl backdrop-blur-3xl overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500/50 via-indigo-600/20 to-transparent" />
             
             <div className="p-10 border-b border-gray-100/50 dark:border-white/5 flex items-center justify-between">
                <div className="space-y-1">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">Inventaris Registri</h3>
                   <p className="text-2xl font-black text-foreground tracking-tighter uppercase italic">{consignment.items?.length || 0} Skus Terdaftar</p>
                </div>
                <div className="px-6 py-3 bg-gray-100/50 dark:bg-white/[0.03] rounded-2xl border border-gray-200/50 dark:border-white/5 flex items-center gap-4 group/date">
                   <Calendar className="h-4 w-4 text-primary group-hover/date:scale-110 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{new Date(consignment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
             </div>

             <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100/30 dark:bg-white/[0.01] hover:bg-transparent border-b border-gray-100 dark:border-white/5">
                      <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-mono italic"># Ref</TableHead>
                      <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Deskripsi Barang</TableHead>
                      <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center italic">Qty</TableHead>
                      <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center italic">Sales</TableHead>
                      <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right italic">Unit Cost</TableHead>
                      <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right italic font-black text-primary">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {consignment.items?.map((item) => (
                      <TableRow key={item.id} className="group/row hover:bg-white/80 dark:hover:bg-black/40 transition-all duration-500 border-none">
                        <TableCell className="px-10 py-8 text-[11px] font-black text-muted-foreground/30 font-mono uppercase tracking-widest italic">{item.id.split('-')[0]}</TableCell>
                        <TableCell className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/10 group-hover/row:scale-110 transition-transform">
                                <Package className="h-6 w-6" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-sm font-black text-foreground tracking-tight leading-none group-hover/row:text-primary transition-colors">{item.productVariant?.product?.name} ({item.productVariant?.package})</p>
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">{item.productVariant?.id.split('-')[0]}</p>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-center text-sm font-black text-muted-foreground tracking-tight tabular-nums font-mono">{item.qtyReceived}</TableCell>
                        <TableCell className="px-10 py-8 text-center">
                           <Badge variant="secondary" className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight italic bg-emerald-500/5 text-emerald-600 border-emerald-500/10">
                              {item.qtySettled} Sold
                           </Badge>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-right text-sm font-black text-muted-foreground/60 tabular-nums">Rp {item.unitCost.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="px-10 py-8 text-right">
                           <p className="text-base font-black text-primary tracking-tighter tabular-nums leading-none">
                              <span className="text-[10px] uppercase mr-1 opacity-40">Rp</span> 
                              {(item.unitCost * item.qtyReceived).toLocaleString('id-ID')}
                           </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
           {/* Summary Sidebar */}
           <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 dark:from-indigo-950 dark:to-black rounded-[4rem] p-12 text-white shadow-3xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-48 w-48 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              
              <div className="relative z-10 space-y-10">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-300 opacity-60 leading-none mb-4 italic">Ringkasan Finansial</p>
                    <div className="space-y-1">
                       <p className="text-5xl font-black tracking-[-0.05em] leading-none text-white italic">
                          <span className="text-lg opacity-40 mr-2 not-italic">Rp</span>
                          {consignment.totalAmount.toLocaleString('id-ID')}
                       </p>
                       <p className="text-[10px] font-black text-indigo-300/40 uppercase tracking-widest italic">Total Valuasi Registri</p>
                    </div>
                 </div>

                 <div className="h-px bg-white/10" />

                 <div className="space-y-6">
                    <div className="flex justify-between items-center group/item">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-white group-hover/item:text-indigo-950 transition-all">
                             <ShieldCheck className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 group-hover/item:translate-x-2 transition-transform">Sudah Dilunasi</p>
                       </div>
                       <p className="text-lg font-black tracking-tighter tabular-nums opacity-60">
                         {consignment.totalSettled.toLocaleString('id-ID')}
                       </p>
                    </div>

                    <div className="flex justify-between items-center group/item">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                             <Calculator className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 group-hover/item:translate-x-2 transition-transform">Sisa Liabilitas</p>
                       </div>
                       <p className="text-2xl font-black tracking-tighter tabular-nums text-emerald-400">
                         {(consignment.totalAmount - consignment.totalSettled).toLocaleString('id-ID')}
                       </p>
                    </div>
                 </div>

                 <div className="pt-6">
                    <Button 
                      onClick={onSettle}
                      className="w-full h-16 rounded-[2rem] bg-white text-indigo-950 hover:bg-gray-100 font-black uppercase tracking-widest text-[11px] italic gap-3 shadow-2xl transition-all active:scale-95"
                    >
                       Protokol Pelunasan <ArrowRight className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
           </div>

           <div className="bg-white/40 dark:bg-black/20 rounded-[3rem] p-10 border border-white/40 dark:border-white/5 space-y-8 backdrop-blur-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Truck className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">Detail Pengiriman</h4>
                 <div className="space-y-6">
                    <div className="flex items-center gap-5">
                       <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                          <Handshake className="h-6 w-6 text-muted-foreground/40" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none">Nama Provider</p>
                          <p className="text-sm font-black text-foreground tracking-tight leading-none italic">{consignment.supplier?.name}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-5">
                       <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                          <Tag className="h-6 w-6 text-muted-foreground/40" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none">Status Manifest</p>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black tracking-widest italic rounded-lg px-2 mt-1",
                            consignment.status === 'OPEN' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/5' : 'border-slate-500 text-slate-500'
                          )}>
                             {consignment.status.replace('_', ' ')}
                          </Badge>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
