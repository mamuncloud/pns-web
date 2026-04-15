"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { Event } from "@/types/financial";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { 
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent, 
  ComboboxItem, 
  ComboboxEmpty,
  ComboboxList
} from "@/components/ui/combobox";

interface AllocateStockDialogProps {
  event: Event;
  onSuccess: () => void;
}

export function AllocateStockDialog({ event, onSuccess }: AllocateStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setIsSearching(true);
      try {
        const res = await getProductsFromDb(1, 50, undefined, debouncedSearch);
        if (mounted) setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        if (mounted) setIsSearching(false);
      }
    };
    if (open) loadProducts();
    return () => { mounted = false; };
  }, [debouncedSearch, open]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Auto-select variant if only one
  useEffect(() => {
    if (selectedProduct && selectedProduct.variants.length === 1 && !selectedVariantId) {
      setSelectedVariantId(selectedProduct.variants[0].id || "");
    }
  }, [selectedProduct, selectedVariantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || !quantity) return;

    setIsSubmitting(true);
    try {
      await api.events.allocateStock(event.id, {
        items: [{
          productVariantId: selectedVariantId,
          quantity: parseInt(quantity, 10)
        }]
      });
      toast.success("Stok berhasil dialokasikan!");
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mengalokasikan stok";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId("");
    setSelectedVariantId("");
    setQuantity("");
    setProductSearch("");
  };

  const selectedVariant = selectedProduct?.variants.find(v => v.id === selectedVariantId);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
      <DialogTrigger
        render={
          <Button className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" />
        }
      >
        <Plus className="mr-2 h-5 w-5" />
        Tambah Alokasi Stok
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-primary p-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Alokasi Stok Event</DialogTitle>
              <DialogDescription className="text-primary-foreground/80 font-medium">
                Pindahkan stok dari gudang utama ke event <span className="underline font-bold text-white">{event.name}</span>.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Product Selection */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Pilih Produk</Label>
              <Combobox value={selectedProductId} onValueChange={(val) => {
                setSelectedProductId(val ?? "");
                setSelectedVariantId("");
              }} onInputValueChange={setProductSearch}>
                <ComboboxTrigger className="w-full text-left font-black h-14 px-5 bg-gray-50 border-gray-200/50 rounded-2xl shadow-sm">
                  {selectedProduct ? (
                    <div className="flex flex-col items-start truncate overflow-hidden">
                      <span className="text-[9px] text-primary/70 font-black uppercase tracking-[0.15em] leading-none mb-1">
                        {selectedProduct.brand?.name || "Tanpa Brand"}
                      </span>
                      <span className="text-sm truncate w-full tracking-tight">
                        {selectedProduct.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60 text-sm font-medium italic">Cari produk...</span>
                  )}
                </ComboboxTrigger>
                <ComboboxContent className="w-(--anchor-width) min-w-[340px] p-2 rounded-2xl border-gray-200/50 shadow-2xl backdrop-blur-xl bg-white/95 zcustom">
                  <ComboboxInput placeholder="Cari by nama..." className="h-12 px-4 bg-gray-50 rounded-xl mb-2 border-none" />
                  <ComboboxEmpty className="h-[200px] flex items-center justify-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-8 text-center leading-relaxed">
                      {isSearching ? "Mencari..." : "Produk tidak ditemukan"}
                    </p>
                  </ComboboxEmpty>
                  <ComboboxList className="max-h-[300px] overflow-y-auto space-y-1">
                    {products.map(p => (
                      <ComboboxItem key={p.id} value={p.id} className="flex flex-col items-start gap-1 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors">
                        <span className="text-[9px] text-primary/70 font-black uppercase tracking-widest leading-none">{p.brand?.name}</span>
                        <span className="text-sm font-bold tracking-tight truncate w-full">{p.name}</span>
                        <div className="flex items-center gap-1 text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded-md">
                           Stock: {p.stockQty || 0}
                        </div>
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {/* Variant Selection */}
            {selectedProduct && selectedProduct.variants.length > 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Varian / Ukuran Pak</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.variants.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id || "")}
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                        selectedVariantId === v.id
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                          : "bg-white border-gray-200/50 text-muted-foreground hover:bg-gray-50 hover:-translate-y-0.5"
                      }`}
                    >
                      {v.package} <span className="opacity-60 font-medium">({v.stock} avail)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Kuantitas</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="font-black text-2xl h-16 px-6 bg-gray-50 border-gray-200/50 rounded-2xl focus:ring-primary/20 transition-all text-center pr-16"
                  required
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/50">PCS</span>
              </div>
              {selectedVariant && (
                <p className="text-[10px] font-bold text-amber-600 flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Stok tersedia di gudang utama: {selectedVariant.stock} PCS
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-8 border-t border-gray-100 flex gap-3">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl font-bold h-14"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedVariantId || !quantity || parseInt(quantity) <= 0}
              className="flex-[2] rounded-2xl font-black uppercase tracking-widest text-[11px] h-14 shadow-xl"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proses Alokasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
