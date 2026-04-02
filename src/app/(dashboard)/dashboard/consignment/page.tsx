"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calculator, CircleCheck, Clock } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { ConsignmentForm } from "@/components/dashboard/consignment/ConsignmentForm";
import { SettlementView } from "@/components/dashboard/consignment/SettlementView";
import { ConsignmentDataList } from "@/components/dashboard/consignment/ConsignmentDataList";
import { ConsignmentDetailView } from "@/components/dashboard/consignment/ConsignmentDetailView";
import { api } from "@/lib/api";
import { Consignment } from "@/types/financial";

type ViewState = "list" | "settle" | "detail";


export default function ConsignmentPage() {
  const [view, setView] = useState<ViewState>("list");
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.consignment.list(debouncedSearch || undefined);
        if (!cancelled) setConsignments(data);
      } catch (error: unknown) {
        console.error("Failed to fetch consignments", error);
        toast.error("Gagal memuat daftar konsinyasi.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const stats = useMemo(() => {
    const active = consignments.filter(c => c.status !== 'CLOSED').length;
    const needSettlement = consignments.reduce((acc, c) => acc + (c.totalAmount - c.totalSettled), 0);
    const completed = consignments.filter(c => c.status === 'CLOSED').length;
    return { active, needSettlement, completed };
  }, [consignments]);

  if (view === "settle" && selectedConsignment) {
    return (
      <SettlementView 
        consignment={selectedConsignment}
        onBack={() => {
          setView("list");
          setSelectedConsignment(null);
        }} 
        onSuccess={() => {
          setView("list");
          setSelectedConsignment(null);
          api.consignment.list(debouncedSearch || undefined)
            .then(({ data }) => setConsignments(data))
            .catch((error: unknown) => {
              console.error("Failed to fetch consignments", error);
              toast.error("Gagal memuat daftar konsinyasi.");
            });
        }} 
      />
    );
  }

  if (view === "detail" && selectedConsignment) {
    return (
      <ConsignmentDetailView 
        consignment={selectedConsignment}
        onBack={() => {
          setView("list");
          setSelectedConsignment(null);
        }}
        onSettle={() => {
           setView("settle");
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 scroll-smooth">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Titip Barang
          </h2>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.4em] text-[10px] opacity-70 italic">
            Protokol Inventaris Titipan Unit Planet Nyemil Snack
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              label: "Protokol Aktif", 
              value: stats.active, 
              color: "blue", 
              icon: Clock, 
              suff: "Running",
              desc: "Menunggu audit"
            },
            { 
              label: "Utang Pelunasan", 
              value: stats.needSettlement, 
              color: "amber", 
              icon: Calculator, 
              isCurrency: true,
              suff: "Liability",
              desc: "Estimasi total"
            },
            { 
              label: "Siklus Final", 
              value: stats.completed, 
              color: "emerald", 
              icon: CircleCheck, 
              suff: "Archived",
              desc: "Lunas sepenuhnya"
            }
          ].map((stat, i) => (
            <Card key={i} className="border-none bg-gradient-to-br from-white/40 to-white/20 dark:from-white/5 dark:to-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-700 border border-white/20 dark:border-white/5 shadow-xl shadow-black/[0.02] relative">
              <div className={cn("absolute inset-y-0 left-0 w-1 opacity-20 transition-all duration-700 group-hover:w-2", 
                stat.color === 'blue' ? 'bg-blue-600' : 
                stat.color === 'amber' ? 'bg-amber-600' : 'bg-emerald-600'
              )} />
              <CardContent className="p-8 flex items-center justify-between gap-6">
                <div className="space-y-3 flex-1 text-left">
                  <div className="space-y-1">
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-2 italic", 
                      stat.color === 'blue' ? 'text-blue-500' : 
                      stat.color === 'amber' ? 'text-amber-500' : 'text-emerald-500'
                    )}>{stat.label}</p>
                    <div className="flex items-baseline gap-2 text-foreground">
                      {stat.isCurrency && <span className="text-[12px] font-black opacity-20 italic">IDR</span>}
                      <p className="text-3xl font-black tracking-tighter tabular-nums leading-none">
                        {stat.isCurrency ? stat.value.toLocaleString('id-ID') : stat.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border transition-all group-hover:scale-105", 
                      stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm shadow-blue-500/5' : 
                      stat.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/5' : 
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                    )}>
                      {stat.suff}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">{stat.desc}</span>
                  </div>
                </div>
                <div className={cn("h-16 w-16 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-2xl p-4.5 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110", 
                  stat.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-500/30' : 
                  stat.color === 'amber' ? 'bg-amber-500 text-white shadow-amber-500/30' : 
                  'bg-emerald-500 text-white shadow-emerald-500/30'
                )}>
                  <stat.icon className="h-full w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Embedded Registration Form */}
        <div className="pb-4">
          <ConsignmentForm 
            onSuccess={() => {
              api.consignment.list(debouncedSearch || undefined)
                .then(({ data }) => setConsignments(data))
                .catch((error: unknown) => {
                  console.error("Failed to fetch consignments", error);
                  toast.error("Gagal memuat daftar konsinyasi.");
                });
              document.getElementById("history")?.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
        </div>

        {/* History Section (The List) */}
        <ConsignmentDataList 
          consignments={consignments}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onSettle={(c) => {
            setSelectedConsignment(c);
            setView("settle");
          }}
          onDetail={(c) => {
            setSelectedConsignment(c);
            setView("detail");
          }}
        />
      </div>
    </div>
  );
}
