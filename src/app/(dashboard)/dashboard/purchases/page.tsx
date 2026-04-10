"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { getProductsFromDb } from "@/lib/products-db";
import { api, Supplier } from "@/lib/api";
import { Product } from "@/types/product";
import { EmptyProductState } from "@/components/dashboard/EmptyProductState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ChevronRight,
  Calculator,
  Calendar,
  User,
  Check,
  ArrowRight,
  Receipt,
  Package,
  Layers,
  Sparkles,
  Scale,
  Tag
} from "lucide-react";
import { PurchaseHistory } from "@/components/dashboard/purchases/PurchaseHistory";
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

interface PurchaseItem {
  id: string;
  productId: string;
  package: string;
  productName: string;
  brandName: string;
  qty: number;
  sizeInGram: number; // New field
  totalCost: number;
  extraCosts: number;
  unitCost: number;
  lastCost: number;
  priceChange: number;
  sellingPrice: number;
  marginPct: number;
  marginAmount: number;
  avgCostPreview: number;
  expiredDate: string;
}

export default function PurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<'DRAFT' | 'COMPLETED'>('DRAFT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInternalReload = useRef(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ 
    title: "", 
    description: "", 
    targetStatus: 'DRAFT' as 'DRAFT' | 'COMPLETED' 
  });
  const [supplierSearch, setSupplierSearch] = useState("");
  const debouncedSupplierSearch = useDebounce(supplierSearch, 500);

  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch, 500);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  const fetchSuppliers = useCallback(async (search?: string) => {
    setIsSuppliersLoading(true);
    try {
      const { data } = await api.suppliers.list(search);
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    } finally {
      setIsSuppliersLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (search?: string) => {
    setIsProductsLoading(true);
    try {
      const { data } = await getProductsFromDb(1, 100, undefined, search);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsProductsLoading(false);
      setIsLoading(false);
    }
  }, []);

  // Initial products load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced supplier fetch
  useEffect(() => {
    fetchSuppliers(debouncedSupplierSearch);
  }, [debouncedSupplierSearch, fetchSuppliers]);

  // Debounced product fetch
  useEffect(() => {
    fetchProducts(debouncedProductSearch);
  }, [debouncedProductSearch, fetchProducts]);

  // Prevent accidental page reload if there are unsaved items or submission is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isInternalReload.current) return;
      if (isSubmitting || items.length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Standard way to trigger browser confirmation
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting, items.length]);

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      package: "",
      productName: "",
      brandName: "",
      qty: 1,
      sizeInGram: 0,
      totalCost: 0,
      extraCosts: 0,
      unitCost: 0,
      lastCost: 0,
      priceChange: 0,
      sellingPrice: 0,
      marginPct: 0,
      marginAmount: 0,
      avgCostPreview: 0,
      expiredDate: ""
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<PurchaseItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if (updates.productId) {
          const product = products.find(p => p.id === updates.productId);
          updated.productName = product?.name || "";
          updated.brandName = product?.brand?.name || "";
          // Backend uses 'label', map it correctly to the frontend's item expectation
          const defaultVariant = product?.variants?.[0];
          updated.package = defaultVariant?.package || "bal"; 
          updated.lastCost = product?.currentHpp || (product?.variants?.[0]?.price || 0) * 0.7;
          updated.sellingPrice = product?.sellingPrice || product?.variants?.[0]?.price || 0;
        }

        // Logic for auto-calculations
        const currentProduct = products.find(p => p.id === updated.productId);

        if (updated.qty > 0) {
          updated.unitCost = (updated.totalCost + updated.extraCosts) / updated.qty;
          
          if (updated.lastCost > 0) {
            updated.priceChange = ((updated.unitCost - updated.lastCost) / updated.lastCost) * 100;
          }

          if ('marginPct' in updates) {
            // If user explicitly updated marginPct
            const rawSellingPrice = updated.unitCost * (1 + (updated.marginPct / 100));
            updated.sellingPrice = Math.ceil(rawSellingPrice / 1000) * 1000;
            updated.marginAmount = updated.sellingPrice - updated.unitCost;
          } else if (updated.sellingPrice > 0) {
            // Otherwise, calculate marginPct from sellingPrice (standard behavior)
            updated.marginAmount = updated.sellingPrice - updated.unitCost;
            updated.marginPct = (updated.marginAmount / updated.unitCost) * 100;
          }

          // HPP Preview Calculation
          const currentStock = currentProduct?.stockQty || 0;
          const totalNewQty = currentStock + updated.qty;
          if (totalNewQty > 0) {
            updated.avgCostPreview = (currentStock * updated.lastCost + updated.qty * updated.unitCost) / totalNewQty;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const totalPurchase = items.reduce((acc, item) => acc + item.totalCost, 0);

  const handleSubmit = async (targetStatus: 'DRAFT' | 'COMPLETED') => {
    if (items.length === 0 || !supplier) {
      toast.error("Items and supplier are required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.purchases.create({
        supplierId: supplier,
        date: new Date(date).toISOString(),
        note,
        status: targetStatus,
        items: items.map(item => ({
          productId: item.productId,
          package: item.package,
          qty: item.qty,
          sizeInGram: item.sizeInGram || undefined,
          totalCost: item.totalCost,
          extraCosts: item.extraCosts,
          sellingPrice: item.sellingPrice,
          expiredDate: item.expiredDate ? new Date(item.expiredDate).toISOString() : undefined
        }))
      });
      
      toast.success(targetStatus === 'COMPLETED' ? 'Pembelian berhasil dikonfirmasi!' : 'Draft berhasil disimpan!');
      
      // Reload page to refresh all states and history
      isInternalReload.current = true;
      setTimeout(() => window.location.reload(), 1000); // Give toast time to be seen
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error submitting purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerConfirm = (s: 'DRAFT' | 'COMPLETED') => {
    setConfirmConfig({
      targetStatus: s,
      title: s === 'COMPLETED' ? "Konfirmasi Pembelian" : "Simpan sebagai Draft",
      description: s === 'COMPLETED' 
        ? "Stok akan langsung ditambahkan ke inventori. Lanjutkan?" 
        : "Simpan sebagai draft untuk diedit nanti. Lanjutkan?"
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 scroll-smooth">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Kulakan Barang</h2>
          <p className="text-sm text-muted-foreground font-medium">Input stok masuk dan pantau perubahan harga beli (HPP).</p>
        </div>

      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div className="h-60 rounded-xl bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="h-80 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : products.length === 0 ? (
        <EmptyProductState 
          title="Produk Belum Terdaftar"
          description="Anda tidak dapat melakukan kulakan sebelum mendaftarkan produk. Silakan tambahkan produk di menu Kelola Produk terlebih dahulu."
        />
      ) : (
        <>
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">
                      <User className="h-3 w-3 text-primary" /> Supplier
                    </label>
                    <Combobox 
                      value={supplier} 
                      onValueChange={(val) => setSupplier(val ?? "")}
                      onInputValueChange={setSupplierSearch}
                    >
                      <ComboboxTrigger className="h-14 font-black px-5 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 focus:ring-primary/20 transition-all rounded-2xl shadow-sm">
                        {supplier 
                          ? (suppliers.find(s => s.id === supplier)?.name || supplier) 
                          : "Pilih supplier..."}
                      </ComboboxTrigger>
                      <ComboboxContent align="start" className="w-(--anchor-width) min-w-[280px] p-2 rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-gray-950/90">
                        <ComboboxInput 
                          placeholder="Cari supplier..." 
                          className="h-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2 border-none focus:ring-0"
                        />
                        <ComboboxList className="max-h-[300px] overflow-y-auto space-y-1">
                          {suppliers.map((s) => (
                            <ComboboxItem 
                              key={s.id} 
                              value={s.id}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 cursor-pointer group/item transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm group-hover/item:text-primary transition-colors">{s.name}</span>
                                {s.contactName && <span className="text-[10px] text-muted-foreground">{s.contactName}</span>}
                              </div>
                              <Check className="h-4 w-4 text-primary opacity-0 group-data-[selected]:opacity-100 transition-opacity" />
                            </ComboboxItem>
                          ))}
                          {suppliers.length === 0 && !isSuppliersLoading && (
                            <ComboboxEmpty className="py-6 text-center text-xs text-muted-foreground font-bold italic">
                              Supplier tidak ditemukan
                            </ComboboxEmpty>
                          )}
                          {isSuppliersLoading && (
                            <ComboboxEmpty className="py-6 text-center text-xs text-muted-foreground font-bold animate-pulse">
                              Mencari supplier...
                            </ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">
                      <Calendar className="h-3 w-3 text-primary" /> Tanggal Pembelian
                    </label>
                    <div className="relative group">
                      <Input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-14 font-black px-5 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 focus:ring-primary/20 transition-all rounded-2xl shadow-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">
                      Keterangan (Optional)
                    </label>
                    <Input 
                      placeholder="Contoh: Pembelian stok bulanan, diskon supplier, dll."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="h-14 font-black px-5 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 focus:ring-primary/20 transition-all rounded-2xl shadow-sm"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="bg-white/40 dark:bg-black/10 p-8 border-t border-gray-100 dark:border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-1 mb-2 opacity-70">Target Status</span>
                    <div className="flex bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-[1.25rem] border border-gray-200/50 dark:border-white/5 backdrop-blur-md shadow-inner">
                      <button 
                        type="button"
                        onClick={() => setStatus('DRAFT')}
                        className={cn(
                          "px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2",
                          status === 'DRAFT' 
                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-600/10" 
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-white dark:hover:bg-gray-800"
                        )}
                      >
                        <Receipt className={cn("h-3.5 w-3.5", status === 'DRAFT' ? "opacity-100" : "opacity-40")} />
                        Draft
                      </button>
                      <button 
                        type="button"
                        onClick={() => setStatus('COMPLETED')}
                        className={cn(
                          "px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2",
                          status === 'COMPLETED' 
                            ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-600/10" 
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-white dark:hover:bg-gray-800"
                        )}
                      >
                        <Check className={cn("h-3.5 w-3.5", status === 'COMPLETED' ? "opacity-100" : "opacity-40")} />
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 bg-white/60 dark:bg-gray-900/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-800/50 shadow-sm grow max-w-md">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", 
                    status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600")}>
                    {status === 'COMPLETED' ? <Package className="h-6 w-6" /> : <Layers className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5 opacity-50">Operation Context</p>
                    <p className="text-[12px] font-bold text-foreground leading-snug tracking-tight">
                      {status === 'COMPLETED' 
                        ? "Warehouse stock and HPP will be updated immediately." 
                        : "Only records data for later review and editing."}
                    </p>
                  </div>
                  <div className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ml-auto",
                    status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" : "bg-indigo-500/10 text-indigo-500 shadow-indigo-500/10"
                  )}>
                    {status === 'COMPLETED' ? <Check className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                  </div>
                </div>
              </div>
            </Card>

  
            {/* Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Daftar Barang</h3>
                <Button 
                  type="button" 
                  onClick={addItem} 
                  className="group relative h-12 px-6 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px] italic transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] border border-white/10 text-primary-foreground"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <Plus className="h-4 w-4 transition-all duration-500 group-hover:rotate-90 group-hover:scale-110" />
                      <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-primary-foreground rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </div>
                    <span className="relative">
                      Tambah Item
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-foreground/30 transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Button>
              </div>
  
              {items.length === 0 ? (
                <Card className="border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                  <CardContent className="p-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">Belum ada barang yang ditambahkan.</p>
                    <Button type="button" onClick={addItem} variant="link" className="text-primary font-bold mt-2">
                      Klik untuk tambah item pertama
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <Card key={item.id} className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl mt-6">
                      <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-gray-100/50 dark:divide-gray-800/50">
                          {/* 1. Header: Product Selection */}
                          <div className="p-6 bg-gray-50/30 dark:bg-gray-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                {idx + 1}
                              </div>
                              <div className="flex flex-col min-w-[120px]">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1.5 flex items-center gap-2">
                                  <Package className="h-3 w-3" /> SKU SELECTION
                                </span>
                                <span className="text-sm font-black text-foreground truncate max-w-[200px] tracking-tight">
                                  {item.productName || "Belum dipilih"}
                                </span>
                              </div>
                            </div>
  
                            <div className="flex-1 max-w-lg w-full">
                            <Combobox 
                              value={item.productId || ""} 
                              onValueChange={(val) => updateItem(item.id, { productId: val ?? "" })}
                              onInputValueChange={setProductSearch}
                            >
                              <ComboboxTrigger className="h-14 font-black bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-5 shadow-sm hover:border-primary/30 transition-all text-left group/trigger">
                                {item.productId ? (
                                  <div className="flex flex-col items-start truncate">
                                    <span className="text-[9px] text-primary/70 font-black uppercase tracking-[0.15em] leading-none mb-1">
                                      {item.brandName || "Tanpa Brand"}
                                    </span>
                                    <span className="text-sm truncate w-full tracking-tight">
                                      {item.productName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/60 text-sm font-medium italic">Cari barang by Nama/Brand...</span>
                                )}
                              </ComboboxTrigger>
                              <ComboboxContent align="start" className="w-(--anchor-width) min-w-[340px] p-2 rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-950/90">
                                <ComboboxInput placeholder="Tulis nama barang..." className="h-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2 border-none focus:ring-1 focus:ring-primary/20" />
                                <ComboboxEmpty className="py-12 text-center">
                                  {isProductsLoading ? (
                                    <>
                                      <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                      <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Mencari barang...</p>
                                    </>
                                  ) : (
                                    <>
                                      <Package className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SKU tidak ditemukan</p>
                                    </>
                                  )}
                                </ComboboxEmpty>
                                <ComboboxList className="space-y-1 max-h-72 overflow-y-auto pr-1">
                                  {products.map(p => (
                                    <ComboboxItem 
                                      key={p.id} 
                                      value={p.id} 
                                      className="rounded-xl py-3 px-4 font-black cursor-pointer hover:bg-primary/5 transition-colors"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-primary/70 font-black uppercase tracking-widest leading-none">{p.brand?.name || "Tanpa Brand"}</span>
                                        <span className="text-sm tracking-tight">{p.name}</span>
                                      </div>
                                    </ComboboxItem>
                                  ))}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                            </div>
  
                            <button type="button" onClick={() => removeItem(item.id)} className="h-12 w-12 flex items-center justify-center text-muted-foreground/20 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl self-end sm:self-auto mt-2 sm:mt-0 shrink-0">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
  
                          {/* 2. Structured Resource Inputs (Rows) */}
                          <div className="p-8 space-y-10 group-hover:bg-white/40 dark:group-hover:bg-gray-900/40 transition-colors duration-500">
                            {/* Row 1: Specifications (Label, Weight, Expiry) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 flex items-center gap-1.5">
                                  <Tag className="h-3 w-3" /> Label Satuan
                                </label>
                                <div className="relative group/select">
                                  <select 
                                    value={item.package || "bal"}
                                    onChange={(e) => {
                                      const newLabel = e.target.value;
                                      const updates: Partial<PurchaseItem> = { package: newLabel };
                                      
                                      // Auto-extract weight from label if it matches certain patterns
                                      const weightMatch = newLabel.match(/(\d+)(gr|kg)/i);
                                      if (weightMatch) {
                                        const val = parseInt(weightMatch[1]);
                                        const unit = weightMatch[2].toLowerCase();
                                        updates.sizeInGram = unit === 'kg' ? val * 1000 : val;
                                      }
                                      
                                      updateItem(item.id, updates);
                                    }}
                                    className="w-full h-14 font-black text-sm bg-gray-50/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                                  >
                                    <option value="bal">BAL (Default)</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Small">Small</option>
                                    <option value="250gr">250gr</option>
                                    <option value="500gr">500gr</option>
                                    <option value="1kg">1kg</option>
                                  </select>
                                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 rotate-90 pointer-events-none transition-transform group-focus-within/select:rotate-0" />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 flex items-center gap-1.5 focus-within:text-primary transition-colors">
                                  <Scale className="h-3 w-3" /> Berat
                                </label>
                                <div className="relative group/input shadow-sm rounded-2xl overflow-hidden">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={item.sizeInGram || ""}
                                    onChange={(e) => updateItem(item.id, { sizeInGram: Number(e.target.value) })}
                                    className="h-14 font-black text-xl bg-gray-50/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-5 transition-all focus:ring-4 focus:ring-primary/5 border-none"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest pointer-events-none">
                                    {(item.sizeInGram || 0) >= 1000 ? "KG" : "GR"}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 px-1">
                                  <Calendar className="h-3 w-3 text-orange-500" /> Kadaluwarsa
                                </label>
                                <div className="relative group/input shadow-sm rounded-2xl overflow-hidden">
                                  <Input 
                                    type="date" 
                                    value={item.expiredDate || ""}
                                    onChange={(e) => updateItem(item.id, { expiredDate: e.target.value })}
                                    className="h-14 font-black bg-gray-50/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-5 transition-all focus:ring-4 focus:ring-orange-500/5 border-none"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-800 to-transparent" />

                            {/* Row 2: Financials (Qty, Total Cost, Extra Cost) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Kuantitas</label>
                                <div className="relative group/input shadow-sm rounded-2xl overflow-hidden">
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    value={item.qty || ""}
                                    onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                                    className="h-14 font-black text-xl bg-gray-50/50 dark:bg-gray-900/50 border-none rounded-2xl px-5 transition-all focus:ring-4 focus:ring-primary/5"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Total Biaya (Supplier)</label>
                                <div className="relative group-within:scale-[1.02] transition-transform duration-300 shadow-sm rounded-2xl overflow-hidden">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground/40">Rp</span>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={item.totalCost || ""}
                                    onChange={(e) => updateItem(item.id, { totalCost: Number(e.target.value) })}
                                    className="h-14 font-black text-xl bg-gray-50/50 dark:bg-gray-900/50 border-none rounded-2xl pl-11 pr-5 transition-all focus:ring-4 focus:ring-primary/5"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Extra Item Cost</label>
                                <div className="relative group-within:scale-[1.02] transition-transform duration-300 shadow-sm rounded-2xl overflow-hidden">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground/40">Rp</span>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={item.extraCosts || ""}
                                    onChange={(e) => updateItem(item.id, { extraCosts: Number(e.target.value) })}
                                    className="h-14 font-black text-xl bg-gray-50/50 dark:bg-gray-900/50 border-none rounded-2xl pl-11 pr-5 transition-all focus:ring-4 focus:ring-primary/5"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

                            {/* Row 3: Pricing & Intelligence */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                              {/* Selling Price - THE PRIMARY TARGET */}
                              <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 px-1 flex items-center gap-1.5 focus-within:text-primary transition-colors">
                                  <TrendingUp className="h-3 w-3" /> Harga Jual Baru
                                </label>
                                <div className="relative group-within:scale-[1.05] transition-transform duration-500 rounded-2xl overflow-hidden shadow-lg shadow-primary/5">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary/30 group-focus-within:text-primary/50 transition-colors">Rp</span>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={item.sellingPrice || ""}
                                    onChange={(e) => updateItem(item.id, { sellingPrice: Number(e.target.value) })}
                                    className="h-14 font-black text-xl bg-primary/[0.03] dark:bg-primary/[0.05] border-primary/20 dark:border-primary/30 text-primary rounded-2xl pl-11 pr-5 focus:ring-8 focus:ring-primary/5 transition-all"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Unit Cost Preview */}
                              <div className="bg-white/50 dark:bg-gray-900/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center group/stat hover:border-primary/20 transition-all h-24 justify-center">
                                 <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1 leading-none">Net Unit Cost</span>
                                 <div className="flex items-baseline gap-2">
                                   <span className="text-lg font-black text-foreground tracking-tight">Rp {Math.round(item.unitCost).toLocaleString('id-ID')}</span>
                                   {item.priceChange !== 0 && (
                                     <span className={cn("text-[9px] font-black flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg", 
                                       item.priceChange > 0 ? "text-red-600 bg-red-50 dark:bg-red-950/20" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20")}>
                                       {item.priceChange > 0 ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                                       {Math.abs(item.priceChange).toFixed(1)}%
                                     </span>
                                   )}
                                 </div>
                              </div>

                              {/* Profit Margin - EDITABLE */}
                              <div className="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-5 rounded-3xl border border-emerald-500/20 shadow-sm flex flex-col items-center text-center group/stat hover:bg-emerald-500/[0.06] transition-all h-24 justify-center relative group-within:border-emerald-500/50">
                                 <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1 leading-none">Profit Margin %</span>
                                 <div className="flex flex-col items-center gap-0 w-full transition-transform duration-300">
                                   <div className="relative w-24">
                                     <Input 
                                        type="number"
                                        value={Math.round(item.marginPct)}
                                        onChange={(e) => updateItem(item.id, { marginPct: Number(e.target.value) })}
                                        className="h-8 w-full bg-transparent border-none text-center font-black text-emerald-700 dark:text-emerald-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-0 rounded-lg p-0 text-xl leading-none"
                                     />
                                     <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-700/30 pointer-events-none">%</span>
                                   </div>
                                   <span className="text-[10px] font-bold text-emerald-600/50 italic leading-none truncate">Rp {(item.marginAmount).toLocaleString('id-ID')}</span>
                                 </div>
                              </div>

                              {/* HPP Estimate Preview */}
                              <div className="bg-primary/[0.03] dark:bg-primary/[0.05] p-5 rounded-3xl border border-primary/20 shadow-sm flex flex-col items-center text-center group/stat hover:bg-primary/[0.06] transition-all h-24 justify-center">
                                 <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1 leading-none flex items-center gap-1.5">
                                   <ArrowRight className="h-3 w-3 animate-pulse" /> New HPP Est.
                                 </span>
                                 <div className="flex flex-col items-center">
                                   <span className="text-lg font-black text-primary tracking-tight">
                                     Rp {Math.round(item.avgCostPreview).toLocaleString('id-ID')}
                                   </span>
                                   <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest leading-none mt-0.5">Warehouse Avg</span>
                                 </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
  
          <div className="lg:sticky lg:top-8 h-fit space-y-8">
            <Card className="border-none bg-primary/[0.03] dark:bg-primary/[0.05] backdrop-blur-2xl shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 pt-10 px-10">
                <CardTitle className="text-[11px] font-black flex items-center gap-2.5 text-primary uppercase tracking-[0.3em] opacity-70">
                  <Calculator className="h-4 w-4" />
                  Purchase Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10 p-10 pt-0">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] px-1">Total Pembelian</p>
                  <p className="text-5xl font-black text-foreground tracking-tighter flex items-baseline gap-2 italic">
                    <span className="text-xl text-primary not-italic">Rp</span>
                    {totalPurchase.toLocaleString('id-ID')}
                  </p>
                </div>
  
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                    <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">HPP & Margin Impact</h4>
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                  {items.length === 0 ? (
                    <div className="py-12 text-center bg-white/40 dark:bg-black/20 rounded-3xl border border-dashed border-primary/10">
                      <p className="text-xs text-muted-foreground/50 italic font-bold px-6 leading-relaxed">Masukkan item untuk melihat analisis dampak harga...</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {items.filter(i => i.productId).map(item => (
                        <div key={item.id} className="group/item space-y-2.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black text-foreground truncate max-w-[160px] uppercase tracking-tight">{item.productName}</span>
                            <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border", 
                              item.priceChange > 0 ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:border-red-900/30" : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30")}>
                               {item.priceChange > 0 ? "COST UP" : "COST DOWN"}
                            </div>
                          </div>
                          <div className="p-4 bg-white/80 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 group-hover/item:border-primary/30 transition-all flex items-center justify-between shadow-sm group-hover/item:shadow-md">
                            <div>
                               <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 leading-none">Estimate HPP</p>
                               <p className="text-base font-black text-foreground tracking-tight">Rp {Math.round(item.avgCostPreview).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 leading-none">Net Impact</p>
                               <div className="flex items-center gap-1.5 justify-end">
                                 {item.priceChange > 0 ? <TrendingUp className="h-3 w-3 text-red-500" /> : <TrendingDown className="h-3 w-3 text-emerald-500" />}
                                 <span className={cn("text-xs font-black", item.priceChange > 0 ? "text-red-600" : "text-emerald-600")}>
                                   {Math.abs(item.priceChange).toFixed(1)}%
                                 </span>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
  
                <Button 
                  type="button" 
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all bg-primary text-primary-foreground focus:ring-8 focus:ring-primary/5"
                  disabled={isSubmitting || items.length === 0 || !supplier}
                  onClick={() => triggerConfirm(status)}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                      Processing
                    </div>
                  ) : (
                    status === 'COMPLETED' ? (
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Confirm Purchase
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Save as Draft
                      </div>
                    )
                  )}
                </Button>
              </CardContent>
            </Card>
  
            <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-3xl border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 space-y-4 shadow-xl shadow-amber-900/5 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="h-12 w-12 text-amber-600" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-amber-600/70">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Tips Kulakan
              </p>
              <p className="text-[12px] leading-relaxed font-black uppercase tracking-tight opacity-90">
                Jika harga unit naik &gt;10%, segera sesuaikan harga jual untuk menjaga margin &gt;30%.
              </p>
            </div>
          </div>
        </form>

        <div id="history" className="mt-28 pt-20 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-2 bg-primary rounded-full shadow-lg shadow-primary/20" />
            <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">Riwayat Pembelian</h3>
          </div>
          <PurchaseHistory />
        </div>
      </>
    )}

    <ConfirmationDialog
      open={isConfirmOpen}
      onOpenChange={setIsConfirmOpen}
      title={confirmConfig.title}
      description={confirmConfig.description}
      onConfirm={() => handleSubmit(confirmConfig.targetStatus)}
      confirmText="Lanjutkan"
      cancelText="Batal"
    />
  </div>
);
}
