"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Plus, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent, 
  ComboboxItem, 
  ComboboxEmpty,
  ComboboxList
} from "@/components/ui/combobox";
import { api, Supplier } from "@/lib/api";
import { toast } from "sonner";

interface ConsignmentMetadataProps {
  date: string;
  setDate: (date: string) => void;
  supplierId: string | null;
  setSupplierId: (id: string | null) => void;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

export function ConsignmentMetadata({
  date,
  setDate,
  supplierId,
  setSupplierId,
  suppliers,
  setSuppliers,
}: ConsignmentMetadataProps) {
  const [supplierSearch, setSupplierSearch] = useState("");
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);

  const handleCreateSupplier = async () => {
    if (!supplierSearch.trim()) return;
    
    setIsCreatingSupplier(true);
    try {
      const response = await api.suppliers.create({ name: supplierSearch });
      const newSupplier = response.data;
      
      // Update local suppliers list
      setSuppliers(prev => [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Select the new supplier
      setSupplierId(newSupplier.id);
      
      // Clear search and show success
      setSupplierSearch("");
      toast.success(`Berhasil mendaftarkan supplier: ${newSupplier.name}`);
    } catch (error) {
      console.error("Failed to create supplier:", error);
      toast.error("Gagal mendaftarkan supplier baru");
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  return (
    <Card className="rounded-[2.5rem] border-none bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
      <CardContent className="p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600/70">Waktu Kedatangan</Label>
            </div>
            <div className="relative group">
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-14 bg-white/50 dark:bg-black/20 border-slate-200/60 dark:border-white/5 rounded-2xl px-6 font-bold text-sm focus:ring-4 focus:ring-orange-500/10 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600/70">Entitas Supplier</Label>
            </div>
            
            <Combobox
              value={supplierId || ""}
              onValueChange={setSupplierId}
            >
              <ComboboxTrigger className="h-14 bg-white/50 dark:bg-black/20 border-slate-200/60 dark:border-white/5 rounded-2xl px-6 font-bold text-sm hover:bg-white dark:hover:bg-black/40 transition-all flex items-center justify-between group">
                <span className={cn(supplierId ? "text-foreground" : "text-slate-400 font-medium italic")}>
                  {supplierId ? suppliers.find(s => s.id === supplierId)?.name : "Pilih Supplier..."}
                </span>
                <Plus className="h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
              </ComboboxTrigger>
              <ComboboxContent className="w-[300px] rounded-2xl border-none shadow-2xl backdrop-blur-3xl p-2 bg-white/90 dark:bg-slate-900/90">
                <div className="relative mb-2 px-2">
                  <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary opacity-50" />
                  <ComboboxInput 
                    placeholder="Cari supplier..." 
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="h-10 w-full pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold text-xs border-none ring-0 outline-none" 
                  />
                </div>
                
                {supplierSearch && !suppliers.some(s => s.name.toLowerCase() === supplierSearch.toLowerCase()) && (
                  <div className="px-2 pb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateSupplier();
                      }}
                      disabled={isCreatingSupplier}
                      className="w-full flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-left disabled:opacity-50"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                        <Plus className={cn("h-3.5 w-3.5 text-primary", isCreatingSupplier && "animate-spin")} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60">Supplier Baru</span>
                        <span className="text-[11px] font-bold truncate max-w-[180px]">{`Daftarkan "${supplierSearch}"`}</span>
                      </div>
                    </button>
                  </div>
                )}

                <div className="h-px bg-slate-200 dark:bg-white/5 mb-2 mx-2" />
                <ComboboxList className="max-h-[280px] overflow-y-auto pr-1">
                  <ComboboxEmpty>Supplier tidak ditemukan.</ComboboxEmpty>
                  {suppliers.map((s) => (
                    <ComboboxItem 
                      key={s.id} 
                      value={s.id} 
                      className="flex items-center px-3 h-10 rounded-lg font-semibold text-xs tracking-tight transition-all hover:bg-primary/5"
                    >
                      {s.name}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
