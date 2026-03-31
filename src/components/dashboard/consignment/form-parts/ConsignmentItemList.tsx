"use client";

import { Package, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent, 
  ComboboxItem, 
  ComboboxEmpty,
  ComboboxList
} from "@/components/ui/combobox";

export interface ItemState {
  id: string;
  productId: string;
  productVariantId: string;
  qtyReceived: number;
  unitCost: number;
  productName: string;
  package: string;
}

interface ConsignmentItemListProps {
  items: ItemState[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ItemState>) => void;
  flatVariants: {
    id: string;
    productName: string;
    package: string;
    hpp: number;
    displayName: string;
  }[];
}

export function ConsignmentItemList({
  items,
  onAdd,
  onRemove,
  onUpdate,
  flatVariants,
}: ConsignmentItemListProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 bg-primary/40 rounded-full" />
          <h3 className="text-lg font-bold tracking-tight">Daftar Barang Titipan</h3>
          <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 font-bold border-none">
            {items.length} Items
          </Badge>
        </div>
        
        <button 
          onClick={onAdd}
          className="h-10 px-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary hover:text-white transition-all font-bold text-xs flex items-center gap-2 group text-primary"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
          Tambah Produk
        </button>
      </div>

      <div className="rounded-[2rem] border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="col-span-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">#</div>
          <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produk & Varian</div>
          <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Jumlah</div>
          <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Harga Unit</div>
          <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-slate-200/40 dark:divide-white/5">
          {items.length === 0 ? (
            <div className="py-24 text-center group cursor-pointer" onClick={onAdd}>
              <div className="h-16 w-16 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-800 mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                <Package className="h-8 w-8" />
              </div>
              <p className="text-base font-bold text-slate-400 dark:text-slate-600 italic">Belum ada barang dipilih</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 px-1 border-l-2 border-primary/20 italic">Konfigurasi &apos;Manifest&apos; Protokol</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <ConsignmentItemRow 
                key={item.id}
                idx={idx}
                item={item}
                onRemove={onRemove}
                onUpdate={onUpdate}
                flatVariants={flatVariants}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

interface ConsignmentItemRowProps {
  idx: number;
  item: ItemState;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ItemState>) => void;
  flatVariants: {
    id: string;
    productName: string;
    package: string;
    hpp: number;
    displayName: string;
  }[];
}

function ConsignmentItemRow({ idx, item, onRemove, onUpdate, flatVariants }: ConsignmentItemRowProps) {
  const variant = flatVariants.find(v => v.id === item.productVariantId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-8 py-6 transition-colors hover:bg-white dark:hover:bg-white/5 group">
      <div className="col-span-1 flex items-center md:block">
         <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
           {idx + 1}
         </div>
      </div>

      <div className="col-span-4 w-full">
        <Combobox value={item.productVariantId || null} onValueChange={(val) => onUpdate(item.id, { productVariantId: val || "" })}>
          <ComboboxTrigger className="h-11 w-full px-4 rounded-xl bg-white dark:bg-black/20 border-slate-200/60 dark:border-white/5 font-bold text-sm transition-all flex items-center justify-between hover:border-primary/30 shadow-sm text-foreground">
             {item.productVariantId ? (
               <span className="truncate">{variant?.displayName}</span>
             ) : (
               <span className="text-slate-400 font-medium italic text-xs">Pilih Varian...</span>
             )}
             <Search className="h-3.5 w-3.5 opacity-20 text-foreground" />
          </ComboboxTrigger>
          <ComboboxContent className="w-[400px] rounded-2xl border-none shadow-2xl backdrop-blur-3xl overflow-hidden p-2 bg-white/90 dark:bg-slate-900/90">
            <div className="relative mb-2 p-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-30" />
              <ComboboxInput placeholder="Cari varian..." className="h-10 w-full pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/5 border-none font-bold text-xs ring-0 outline-none" />
            </div>
            <ComboboxEmpty className="text-[10px] p-4 text-center text-slate-400 italic">Produk tidak terdaftar.</ComboboxEmpty>
            <ComboboxList className="max-h-72 overflow-y-auto pr-1">
              {flatVariants.map((v) => (
                <ComboboxItem key={v.id} value={v.id} className="p-3 rounded-xl cursor-pointer hover:bg-primary/5 mb-1">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm tracking-tight">{v.productName}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="px-2 h-5 rounded-md text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">{v.package}</Badge>
                      <span className="text-[11px] font-bold text-slate-400">HPP: Rp {v.hpp?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="col-span-2 w-full">
        <div className="relative group/input">
          <Input 
            type="number"
            value={item.qtyReceived}
            onChange={(e) => onUpdate(item.id, { qtyReceived: parseInt(e.target.value) || 0 })}
            className="h-11 px-4 rounded-xl bg-white dark:bg-black/20 border-slate-200/60 dark:border-white/5 font-black text-sm text-center focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="col-span-2 w-full">
        <div className="relative group/input">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 dark:text-slate-700">Rp</span>
          <Input 
            type="number"
            value={item.unitCost}
            onChange={(e) => onUpdate(item.id, { unitCost: parseInt(e.target.value) || 0 })}
            className="h-11 pl-9 pr-3 rounded-xl bg-white dark:bg-black/20 border-slate-200/60 dark:border-white/5 font-black text-sm tabular-nums text-right focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="col-span-2 text-right">
         <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Subtotal</span>
           <span className="text-sm font-black tabular-nums">
             Rp {(item.qtyReceived * item.unitCost).toLocaleString('id-ID')}
           </span>
         </div>
      </div>

      <div className="col-span-1 flex justify-end">
        <button 
          type="button"
          onClick={() => onRemove(item.id)}
          className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
