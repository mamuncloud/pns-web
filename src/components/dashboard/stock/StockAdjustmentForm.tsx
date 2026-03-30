"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { Boxes, KeyRound, AlertTriangle } from "lucide-react";
import { 
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent, 
  ComboboxItem, 
  ComboboxEmpty,
  ComboboxList
} from "@/components/ui/combobox";

export function StockAdjustmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [reasonType, setReasonType] = useState<"rusak" | "hilang" | "lainnya">("rusak");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getProductsFromDb(1, 400).then(({ data }) => setProducts(data));
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Auto-select first variant if only one, or default to it 
  useEffect(() => {
    if (selectedProduct && selectedProduct.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(selectedProduct.variants[0].id || "");
    }
  }, [selectedProduct, selectedVariantId]);

  const handleSubmit = async () => {
    if (!selectedVariantId || !quantity) {
      toast.error("Varian produk dan kuantitas wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const finalNote = reasonType === "lainnya" 
        ? notes 
        : (reasonType === "rusak" ? "Rusak / Tengik" : "Hilang");
        
      if (reasonType === "lainnya" && !notes.trim()) {
        toast.error("Alasan wajib diisi jika memilih 'Lainnya'.");
        setIsSubmitting(false);
        return;
      }
      
      await api.stock.adjust({
        productVariantId: selectedVariantId,
        quantity: parseInt(quantity, 10),
        note: finalNote || "Manual Adjustment"
      });
      toast.success("Stok berhasil disesuaikan.");
      
      // Reset form
      setSelectedProductId("");
      setSelectedVariantId("");
      setQuantity("");
      setReasonType("rusak");
      setNotes("");

      if (onSuccess) onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyesuaikan stok";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-3xl overflow-hidden mb-8">
      <div className="bg-white/40 dark:bg-black/5 p-6 md:p-8 flex items-center gap-4 border-b border-gray-100/50 dark:border-gray-800/50">
        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm border border-gray-100/50 dark:border-gray-800/50">
          <Boxes className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Penyesuaian Manual</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">Sesuaikan Saldo Akhir Gudang</p>
        </div>
      </div>
      
      <CardContent className="p-6 md:p-8 grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">Produk</label>
              <Combobox value={selectedProductId} onValueChange={(val) => {
                setSelectedProductId(val ?? "");
                setSelectedVariantId("");
              }}>
                <ComboboxTrigger className="w-full text-left font-black h-14 px-5 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 focus:ring-primary/20 transition-all rounded-2xl shadow-sm">
                  {selectedProduct ? selectedProduct.name : "Pilih produk..."}
                </ComboboxTrigger>
                <ComboboxContent className="w-(--anchor-width) min-w-[280px] p-2 rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-gray-950/90">
                  <ComboboxInput placeholder="Cari..." className="h-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2 border-none focus:ring-0" />
                  <ComboboxEmpty className="py-6 text-center text-xs text-muted-foreground font-bold italic">Tidak ditemukan</ComboboxEmpty>
                  <ComboboxList className="max-h-[300px] overflow-y-auto space-y-1">
                    {products.map(p => (
                      <ComboboxItem key={p.id} value={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 cursor-pointer group/item transition-colors font-bold text-sm">
                        {p.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {selectedProduct && selectedProduct.variants.length > 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">Varian</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id || "")}
                      className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm ${
                        selectedVariantId === v.id
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                          : "bg-white/50 border-gray-200/50 text-muted-foreground hover:bg-white/80 dark:bg-gray-900/50 dark:border-gray-800 dark:hover:bg-gray-800 hover:-translate-y-0.5"
                      }`}
                    >
                      {v.package} <span className="opacity-70 font-medium">({v.stock} pcs)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">Delta Kuantitas (+/-)</label>
              <Input
                type="number"
                placeholder="Contoh: -5 (Mengurangi) atau 10 (Menambah)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="font-black text-xl h-14 px-5 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-2xl focus:ring-primary/20 transition-all placeholder:font-medium placeholder:text-muted-foreground/50"
              />
              <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold flex items-center gap-2 mt-2 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-3 py-2 rounded-xl w-fit">
                <AlertTriangle className="h-3.5 w-3.5" />
                Dampak langsung mengubah saldo akhir gudang.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">Catatan/Alasan</label>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setReasonType("rusak")}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm ${
                    reasonType === "rusak" 
                      ? "bg-rose-500 text-white border-rose-600 shadow-md scale-105 dark:bg-rose-600" 
                      : "bg-white/50 border-gray-200/50 text-muted-foreground hover:bg-white/80 dark:bg-gray-900/50 dark:border-gray-800 hover:-translate-y-0.5"
                  }`}
                >
                  Rusak / Tengik
                </button>
                <button
                  type="button"
                  onClick={() => setReasonType("hilang")}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm ${
                    reasonType === "hilang" 
                      ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105 dark:bg-amber-600" 
                      : "bg-white/50 border-gray-200/50 text-muted-foreground hover:bg-white/80 dark:bg-gray-900/50 dark:border-gray-800 hover:-translate-y-0.5"
                  }`}
                >
                  Hilang
                </button>
                <button
                  type="button"
                  onClick={() => setReasonType("lainnya")}
                  className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border shadow-sm ${
                    reasonType === "lainnya" 
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                      : "bg-white/50 border-gray-200/50 text-muted-foreground hover:bg-white/80 dark:bg-gray-900/50 dark:border-gray-800 hover:-translate-y-0.5"
                  }`}
                >
                  Lainnya
                </button>
              </div>

              {reasonType === "lainnya" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
                  <Input
                    placeholder="Contoh: Salah input dari sistem, stock opname selisih..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-14 font-medium px-5 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-2xl focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <div className="bg-white/40 dark:bg-black/10 p-6 md:p-8 border-t border-gray-100/50 dark:border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-rose-500/70 border border-rose-100 dark:border-rose-500/10 bg-rose-50/50 dark:bg-rose-500/5 px-4 py-2 rounded-xl">
          <KeyRound className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Manager Only</span>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedVariantId || !quantity} 
          className="h-14 w-full md:w-auto font-black uppercase tracking-widest text-[11px] rounded-2xl px-10 shadow-2xl bg-foreground text-background hover:bg-foreground/90 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "Menyimpan..." : "Konfirmasi Adjustment"}
        </Button>
      </div>
    </Card>
  );
}
