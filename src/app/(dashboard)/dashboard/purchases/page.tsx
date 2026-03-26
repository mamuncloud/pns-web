"use client";

import { useEffect, useState } from "react";
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
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Combobox, 
  ComboboxTrigger, 
  ComboboxInput, 
  ComboboxContent, 
  ComboboxItem, 
  ComboboxEmpty 
} from "@/components/ui/combobox";

interface PurchaseItem {
  id: string;
  productId: string;
  variantLabel: string;
  productName: string;
  brandName: string;
  qty: number;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data } = await getProductsFromDb(1, 100);
      setProducts(data);
      setIsLoading(false);
    }

    async function fetchSuppliers() {
      setIsSuppliersLoading(true);
      try {
        const { data } = await api.suppliers.list();
        setSuppliers(data);
      } catch (error) {
        console.error("Failed to fetch suppliers", error);
      } finally {
        setIsSuppliersLoading(false);
      }
    }

    fetchProducts();
    fetchSuppliers();
  }, []);

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      variantLabel: "",
      productName: "",
      brandName: "",
      qty: 1,
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
          updated.variantLabel = product?.variants?.[0]?.package || "Standard";
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
          if (updated.sellingPrice > 0) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !supplier) return;
    
    setIsSubmitting(true);
    try {
      await api.purchases.create({
        supplierId: supplier,
        date: new Date(date).toISOString(),
        note,
        items: items.map(item => ({
          productId: item.productId,
          variantLabel: item.variantLabel,
          qty: item.qty,
          totalCost: item.totalCost,
          extraCosts: item.extraCosts,
          sellingPrice: item.sellingPrice,
          expiredDate: item.expiredDate ? new Date(item.expiredDate).toISOString() : undefined
        }))
      });
      alert(`Success! Pembelian dari ${suppliers.find(s => s.id === supplier)?.name || supplier} berhasil dicatat.`);
      setItems([]);
      setSupplier("");
      setNote("");
    } catch (error: unknown) {
      alert(`Error submitting purchase: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Kulakan Barang</h2>
          <p className="text-muted-foreground">Input stok masuk dan pantau perubahan harga beli (HPP).</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold border-gray-200 dark:border-gray-800 h-11 px-6 rounded-xl hover:bg-gray-50 transition-all">Drafts</Button>
          <Button className="font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Riwayat Pembelian</Button>
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Purchase Header */}
          <Card className="border-none bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                    <User className="h-3 w-3 text-primary" /> Supplier
                  </label>
                  <Combobox 
                    value={supplier} 
                    onValueChange={(val) => setSupplier(val ?? "")}
                  >
                    <ComboboxTrigger className="h-12 font-bold px-4 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-primary/20 transition-all rounded-xl shadow-none">
                      {supplier 
                        ? (suppliers.find(s => s.id === supplier)?.name || supplier) 
                        : "Pilih supplier..."}
                    </ComboboxTrigger>
                    <ComboboxContent align="start" className="w-(--anchor-width) min-w-[280px] p-2 rounded-xl border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-gray-950/90">
                      <ComboboxInput 
                        placeholder="Cari supplier..." 
                        className="h-10 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 border-none focus:ring-0"
                      />
                      <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {suppliers.map((s) => (
                          <ComboboxItem 
                            key={s.id} 
                            value={s.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 cursor-pointer group/item transition-colors"
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
                      </div>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                    <Calendar className="h-3 w-3 text-primary" /> Tanggal Pembelian
                  </label>
                  <div className="relative group">
                    <Input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 font-bold px-4 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-primary/20 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                    Keterangan (Optional)
                  </label>
                  <Input 
                    placeholder="Contoh: Pembelian stok bulanan, diskon supplier, dll."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-12 font-bold px-4 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-primary/20 transition-all rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Daftar Barang</h3>
              <Button type="button" onClick={addItem} size="sm" className="h-8 font-bold gap-1 px-3">
                <Plus className="h-3.5 w-3.5" /> Tambah Item
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
                  <Card key={item.id} className="border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group bg-white/90 dark:bg-gray-950/50 backdrop-blur-sm mt-4">
                    <CardContent className="p-0">
                      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                        {/* 1. Header: Product Selection */}
                        <div className="p-5 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-primary/20">
                              {idx + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Pilih Produk</span>
                              <span className="text-xs font-bold text-muted-foreground truncate max-w-[200px]">
                                {item.productName || "Belum dipilih"}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 max-w-md">
                            <Combobox 
                              value={item.productId || ""} 
                              onValueChange={(val) => updateItem(item.id, { productId: val ?? "" })}
                            >
                              <ComboboxTrigger className="h-12 font-bold bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl px-4 shadow-sm hover:border-primary/30 transition-all text-left">
                                {item.productId ? (
                                  <div className="flex flex-col items-start truncate">
                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter leading-none mb-0.5">
                                      {item.brandName || "Tanpa Brand"}
                                    </span>
                                    <span className="text-sm truncate w-full">
                                      {item.productName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Cari barang...</span>
                                )}
                              </ComboboxTrigger>
                              <ComboboxContent align="start" className="w-(--anchor-width) min-w-[320px] p-2 rounded-xl border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-gray-950/90">
                                <ComboboxInput placeholder="Cari barang atau brand..." className="h-10 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 border-none focus:ring-0" />
                                <ComboboxEmpty className="py-10 text-xs font-bold text-muted-foreground uppercase tracking-widest">Barang tidak ditemukan.</ComboboxEmpty>
                                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                  {products.map(p => (
                                    <ComboboxItem key={p.id} value={p.id} className="rounded-lg py-3 px-3 font-bold cursor-pointer hover:bg-primary/5">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">{p.brand?.name || "Tanpa Brand"}</span>
                                        <span className="text-sm">{p.name}</span>
                                        <span className="text-[10px] text-muted-foreground/70 font-black uppercase tracking-wider">
                                          Stock: {p.stockQty || 0} • Rp {(p.sellingPrice || 0).toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </ComboboxItem>
                                  ))}
                                </div>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground/30 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {/* 2. Primary Inputs: Qty, Cost, Sell Price */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Jumlah (Qty)</label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.qty || ""}
                              onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                              className="h-11 font-black text-lg bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Total Dari Supplier</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">Rp</span>
                              <Input 
                                type="number" 
                                min="0"
                                value={item.totalCost || ""}
                                onChange={(e) => updateItem(item.id, { totalCost: Number(e.target.value) })}
                                className="h-11 font-black text-lg bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl pl-9"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Biaya Ekstra</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">Rp</span>
                              <Input 
                                type="number" 
                                min="0"
                                value={item.extraCosts || ""}
                                onChange={(e) => updateItem(item.id, { extraCosts: Number(e.target.value) })}
                                className="h-11 font-black text-lg bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl pl-9"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-primary tracking-wider px-1">Harga Jual Baru</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-primary/50">Rp</span>
                              <Input 
                                type="number" 
                                min="0"
                                value={item.sellingPrice || ""}
                                onChange={(e) => updateItem(item.id, { sellingPrice: Number(e.target.value) })}
                                className="h-11 font-black text-lg bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 text-primary rounded-xl pl-9 focus:ring-primary/20"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Footer: Intelligence & Stats */}
                        <div className="p-4 bg-gray-50/30 dark:bg-gray-900/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          {/* Expired Date */}
                          <div className="space-y-1.5 px-2">
                             <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-1.5">
                               <AlertCircle className="h-3 w-3 text-orange-500" /> Kadaluwarsa
                             </label>
                             <Input 
                               type="date" 
                               value={item.expiredDate || ""}
                               onChange={(e) => updateItem(item.id, { expiredDate: e.target.value })}
                               className="h-9 font-bold bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl"
                             />
                          </div>

                          {/* Unit Cost Stat */}
                          <div className="bg-white/50 dark:bg-gray-950/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">HPP Item Ini</span>
                             <div className="flex items-baseline gap-2">
                               <span className="text-sm font-black text-foreground">Rp {Math.round(item.unitCost).toLocaleString('id-ID')}</span>
                               {item.priceChange !== 0 && (
                                 <span className={cn("text-[10px] font-black flex items-center gap-0.5", 
                                   item.priceChange > 0 ? "text-red-500" : "text-green-500")}>
                                   {item.priceChange > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                   {Math.abs(item.priceChange).toFixed(1)}%
                                 </span>
                               )}
                             </div>
                          </div>

                          {/* Margin Stat */}
                          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col items-center text-center">
                             <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Margin Kotor</span>
                             <div className="flex items-baseline gap-2">
                               <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">{Math.round(item.marginPct)}%</span>
                               <span className="text-[10px] font-bold text-emerald-600/70">Rp {(item.marginAmount).toLocaleString('id-ID')}</span>
                             </div>
                          </div>

                          {/* HPP Preview (Weighted Average) */}
                          <div className="bg-blue-500/5 dark:bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 shadow-sm flex flex-col items-center text-center">
                             <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                               <ArrowRight className="h-2.5 w-2.5 text-blue-500" /> Estimasi HPP Baru
                             </span>
                             <div className="flex flex-col items-center">
                               <span className="text-sm font-black text-blue-700 dark:text-blue-300">
                                 Rp {Math.round(item.avgCostPreview).toLocaleString('id-ID')}
                               </span>
                               <span className="text-[8px] font-bold text-blue-600/50 uppercase tracking-tighter">Preview hpp gudang</span>
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

        {/* Sidebar: Smart Summary */}
        <div className="space-y-6">
          <Card className="border-none bg-primary/5 dark:bg-primary/900/10 backdrop-blur-xl shadow-2xl shadow-primary/10 rounded-3xl sticky top-8 overflow-hidden">
            <div className="h-1.5 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
            <CardHeader className="pb-4 pt-8 px-8">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                <Calculator className="h-4 w-4" />
                Purchase Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Pembelian</p>
                <p className="text-4xl font-black text-foreground tracking-tighter">
                  <span className="text-lg mr-1 text-primary">Rp</span>
                  {totalPurchase.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dampak ke HPP & Margin</h4>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
                {items.length === 0 ? (
                  <div className="py-8 text-center bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-primary/10">
                    <p className="text-xs text-muted-foreground italic font-medium px-4 leading-relaxed">Masukkan item untuk melihat analisis dampak harga...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.filter(i => i.productId).map(item => (
                      <div key={item.id} className="group/item space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-foreground/80 truncate max-w-[140px] uppercase tracking-tighter">{item.productName}</span>
                          <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded italic">HPP PREVIEW</span>
                        </div>
                        <div className="p-3 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-primary/5 group-hover/item:border-primary/20 transition-all flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">HPP Baru (Est)</p>
                            <p className="text-sm font-black text-foreground">Rp {Math.round((item.lastCost + item.unitCost) / 2).toLocaleString('id-ID')}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover/item:translate-x-1 transition-transform" />
                          <div className="text-right">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Impact</p>
                            <p className={cn("text-[10px] font-black px-2 py-0.5 rounded-full inline-block", item.priceChange > 0 ? "bg-red-50 text-red-600 dark:bg-red-950/30" : "bg-green-50 text-green-600 dark:bg-green-950/30")}>
                               {item.priceChange > 0 ? "Margin ↓" : "Margin ↑"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all bg-primary text-primary-foreground"
                disabled={isSubmitting || items.length === 0 || !supplier}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Konfirmasi & Update Stok"
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 space-y-3 shadow-lg shadow-amber-900/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Tips Kulakan
            </p>
            <p className="text-[11px] leading-relaxed font-bold opacity-80 uppercase tracking-tight"> Jika harga unit naik lebih dari 10%, sistem merekomendasikan untuk menghitung ulang harga jual agar margin tetap sehat (&gt;30%).</p>
          </div>
        </div>
      </form>
      )}
    </div>
  );
}
