"use client";

import { 
  Handshake, 
  Search, 
  MoreVertical,
  Calendar,
  Calculator,
  Eye,
  Trash2,
  ArrowRight
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Consignment } from "@/types/financial";
import { useState, useMemo } from "react";

interface ConsignmentDataListProps {
  consignments: Consignment[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSettle: (consignment: Consignment) => void;
  onDetail: (consignment: Consignment) => void;
}

export function ConsignmentDataList({ 
  consignments, 
  isLoading, 
  search,
  onSearchChange,
  onSettle, 
  onDetail 
}: ConsignmentDataListProps) {
  const [filter, setFilter] = useState("ALL");

  const filteredConsignments = useMemo(() => {
    return consignments.filter(c => {
      const matchesFilter = filter === "ALL" || c.status === filter;
      return matchesFilter;
    });
  }, [consignments, filter]);

  return (
    <div id="history" className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
              Registry <span className="text-primary italic tracking-[-0.05em]">History</span>
            </h2>
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic px-1">Audit Rekonsiliasi & Jejak Protokol</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center flex-1 lg:max-w-3xl">
          <div className="relative group w-full text-left">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-all duration-300" />
            <Input 
              placeholder="Cari Entitas atau Kode Protokol..." 
              className="h-16 pl-14 pr-8 rounded-[2rem] bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-white/5 shadow-sm focus:shadow-emerald-500/5 focus:ring-primary/5 transition-all font-black text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex h-16 bg-gray-100/50 dark:bg-white/[0.03] p-2 rounded-[2rem] border border-gray-200/50 dark:border-white/5 w-full md:w-auto backdrop-blur-xl gap-2">
            {["ALL", "OPEN", "PARTIALLY_SETTLED", "CLOSED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all whitespace-nowrap italic",
                  filter === f 
                    ? "bg-white dark:bg-gray-800 text-foreground shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] scale-105" 
                    : "text-muted-foreground/30 hover:text-foreground/60 hover:bg-white/40 dark:hover:bg-white/5"
                )}
              >
                {f === "ALL" ? "Registri" : f === "OPEN" ? "Aktif" : f === "PARTIALLY_SETTLED" ? "Partial" : "Arsip"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-none bg-white/40 dark:bg-black/20 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        <div className="p-8 border-b border-gray-100/50 dark:border-white/5 flex items-center justify-between relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
             Manifest Protokol Aktif
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-muted-foreground/20 italic uppercase tracking-widest">Urutan Terbaru</span>
             <ArrowRight className="h-3 w-3 text-muted-foreground/20" />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative z-10">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/10 dark:bg-white/[0.01] border-b border-gray-100/50 dark:border-white/5 hover:bg-transparent">
                <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">Protokol / Provider</TableHead>
                <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">Registrasi</TableHead>
                <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center leading-none">Unit</TableHead>
                <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right leading-none">Valuasi</TableHead>
                <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center leading-none">Siklus</TableHead>
                <TableHead className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-right leading-none"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100/30 dark:divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse hover:bg-transparent border-none">
                    <TableCell colSpan={6} className="h-32 px-10">
                       <div className="h-full w-full bg-gray-100/50 dark:bg-white/[0.02] rounded-3xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredConsignments.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={6} className="h-[400px] text-center border-none">
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                      <Handshake className="h-20 w-20 text-muted-foreground mb-6 opacity-20" />
                      <h4 className="text-2xl font-black text-muted-foreground uppercase italic tracking-tighter opacity-40">Zero Registry Found</h4>
                      <p className="text-[10px] font-bold text-muted-foreground/50 mt-2 uppercase tracking-[0.4em] italic px-4 leading-relaxed">System waiting for initial consignment upload</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsignments.map((c) => (
                  <TableRow 
                    key={c.id} 
                    className="group border-none hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-700 cursor-pointer"
                    onClick={() => onDetail(c)}
                  >
                    <TableCell className="px-10 py-10">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-[1.75rem] bg-foreground text-background dark:bg-white dark:text-black flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000 shrink-0 border border-white/20">
                          <Handshake className="h-7 w-7" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <p className="text-lg font-black text-foreground tracking-tighter group-hover:text-primary transition-colors leading-none truncate">{c.supplier?.name}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">ID: {c.id.split('-')[0].toUpperCase()}</span>
                             <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                             <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">{c.items?.length || 0} Skus</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-10">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground/60 uppercase tracking-tight italic">
                          <Calendar className="h-3.5 w-3.5 text-primary/40" />
                          {new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.1em] italic">Timestamp Registri</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-10 text-center">
                       <Badge variant="outline" className="h-8 px-4 rounded-xl border-emerald-500/10 bg-emerald-500/5 text-emerald-600 text-[10px] font-black uppercase tracking-widest italic group-hover:scale-110 transition-transform">
                        {c.items?.reduce((acc, item) => acc + item.qtyReceived, 0) || 0} UNITS
                      </Badge>
                    </TableCell>
                    <TableCell className="px-10 py-10 text-right">
                      <div className="space-y-1">
                        <p className="text-xl font-black tracking-[-0.05em] tabular-nums text-foreground">
                          <span className="text-[10px] font-black text-primary mr-2 opacity-30 italic leading-none">IDR</span>
                          {c.totalAmount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.25em] italic leading-none">Net Valuasi</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-10">
                      <div className="flex justify-center">
                        <Badge variant="outline" className={cn(
                          "font-black text-[9px] uppercase tracking-[0.25em] px-5 py-2 rounded-2xl border-2 transition-all duration-700 group-hover:tracking-[0.4em] italic shadow-sm",
                          c.status === "OPEN" 
                            ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/5" 
                            : c.status === "PARTIALLY_SETTLED"
                            ? "border-amber-500/20 text-amber-600 bg-amber-500/5"
                            : "border-slate-500/20 text-slate-500 bg-slate-500/5"
                        )}>
                          {c.status === "OPEN" ? "Aktif" : c.status === "PARTIALLY_SETTLED" ? "Parsial" : "Final"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-10 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-all duration-700">
                         <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => onDetail(c)}
                          className="h-12 w-12 rounded-2xl border-white/50 dark:border-white/5 bg-white/40 dark:bg-black/40 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl hover:scale-110"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(
                            buttonVariants({ variant: "outline", size: "icon" }),
                            "h-12 w-12 rounded-2xl border-white/50 dark:border-white/5 bg-white/40 dark:bg-black/40 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl hover:scale-110"
                          )}>
                            <MoreVertical className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-80 rounded-[2.5rem] border-white/20 dark:border-white/5 shadow-2xl backdrop-blur-3xl p-4 bg-white/95 dark:bg-black/95 animate-in slide-in-from-top-2 duration-300">
                            <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">Opsi Protokol Pro</DropdownMenuLabel>
                            <div className="space-y-1">
                              <DropdownMenuItem 
                                onClick={() => onDetail(c)}
                                className="rounded-[1.25rem] py-4 px-5 font-black text-[11px] uppercase tracking-widest text-foreground hover:bg-gray-100 dark:hover:bg-white/5 focus:bg-gray-100 dark:focus:bg-white/5 transition-colors gap-4"
                              >
                                <Eye className="h-4 w-4 text-primary" /> Lihat Manifest Lengkap
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onSettle(c)}
                                className="rounded-[1.25rem] py-4 px-5 font-black text-[11px] uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 focus:bg-emerald-50 dark:focus:bg-emerald-950/20 transition-colors gap-4"
                              >
                                <Calculator className="h-4 w-4" /> Kalkulasi Pelunasan
                              </DropdownMenuItem>
                              <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-2" />
                              <DropdownMenuItem 
                                className="rounded-[1.25rem] py-4 px-5 font-black text-[11px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 transition-colors gap-4 opacity-50 grayscale hover:grayscale-0"
                              >
                                <Trash2 className="h-4 w-4" /> Anulir & Hapus Registri
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
