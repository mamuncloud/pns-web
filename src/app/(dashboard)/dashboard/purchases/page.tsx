"use client";

import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
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
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  totalCost: number;
  unitCost: number;
  lastCost: number;
  priceChange: number;
}

export default function PurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await getProductsFromDb(1, 100);
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      productName: "",
      qty: 0,
      totalCost: 0,
      unitCost: 0,
      lastCost: 0,
      priceChange: 0
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
          updated.lastCost = product?.hpp || (product?.variants[0]?.price || 0) * 0.7;
        }
        if (updated.qty > 0 && updated.totalCost > 0) {
          updated.unitCost = updated.totalCost / updated.qty;
          if (updated.lastCost > 0) {
            updated.priceChange = ((updated.unitCost - updated.lastCost) / updated.lastCost) * 100;
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Purchase from ${supplier} submitted! Total: Rp ${totalPurchase.toLocaleString('id-ID')}`);
    setItems([]);
    setSupplier("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Kulakan Barang</h2>
          <p className="text-muted-foreground">Input stok masuk dan pantau perubahan harga beli (HPP).</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold border-gray-200 dark:border-gray-800">Drafts</Button>
          <Button className="font-bold">Riwayat Pembelian</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Header */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3" /> Supplier
                  </label>
                  <Input 
                    placeholder="Nama Supplier..." 
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="h-11 font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Tanggal Pembelian
                  </label>
                  <Input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 font-bold"
                    required
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
                  <Card key={item.id} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-gray-100 dark:divide-gray-800">
                        {/* Product Select */}
                        <div className="flex-1 p-4 bg-gray-50/30 dark:bg-gray-900/10">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black text-primary uppercase">Item #{idx + 1}</span>
                             <button type="button" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                               <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                           <select 
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 font-bold text-sm outline-none"
                            value={item.productId}
                            onChange={(e) => updateItem(item.id, { productId: e.target.value })}
                            required
                           >
                             <option value="">-- Pilih Produk --</option>
                             {products.map(p => (
                               <option key={p.id} value={p.id}>{p.name}</option>
                             ))}
                           </select>
                        </div>

                        {/* Qty & Cost Input */}
                        <div className="p-4 grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Jumlah (Qty)</label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.qty || ""}
                              onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                              className="h-9 font-bold"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">Harga Total</label>
                            <Input 
                              type="number" 
                              min="0"
                              value={item.totalCost || ""}
                              onChange={(e) => updateItem(item.id, { totalCost: Number(e.target.value) })}
                              className="h-9 font-bold"
                              required
                            />
                          </div>
                        </div>

                        {/* Smart Insight (Per Item) */}
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 md:w-64 space-y-2">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-muted-foreground">Harga per Unit</span>
                             <span className={cn("text-sm font-black text-foreground", item.unitCost > item.lastCost ? "text-red-600" : "text-green-600")}>
                               Rp {item.unitCost.toLocaleString('id-ID')}
                             </span>
                           </div>
                           {item.lastCost > 0 && item.productId && (
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                 Beli Terakhir: <span className="text-foreground">Rp {item.lastCost.toLocaleString('id-ID')}</span>
                               </span>
                               <div className={cn("inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full", 
                                 item.priceChange > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                 {item.priceChange > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                 {Math.abs(item.priceChange).toFixed(1)}%
                               </div>
                             </div>
                           )}
                           {item.priceChange > 10 && (
                             <div className="flex items-center gap-1.5 p-1.5 bg-red-100/50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                               <AlertTriangle className="h-3 w-3 text-red-600" />
                               <span className="text-[9px] font-black text-red-700 dark:text-red-400 uppercase leading-none">Warning: Harga naik tajam!</span>
                             </div>
                           )}
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
          <Card className="border-primary/20 bg-primary/5 dark:border-primary/900 dark:bg-primary/900/10 shadow-sm border-2 sticky top-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-primary uppercase tracking-wider">
                <Calculator className="h-4 w-4" />
                Purchase Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">Total Pembelian</p>
                <p className="text-3xl font-black text-foreground">Rp {totalPurchase.toLocaleString('id-ID')}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-primary/10 pb-2">Dampak ke HPP & Margin</h4>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Masukkan item untuk melihat dampak...</p>
                ) : (
                  <div className="space-y-4">
                    {items.filter(i => i.productId).map(item => (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground truncate max-w-[120px]">{item.productName}</span>
                          <span className="text-[10px] font-black text-primary">NEW HPP PREVIEW</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-900 rounded border border-primary/10 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground">HPP Baru (Est)</p>
                            <p className="text-xs font-black">Rp {Math.round((item.lastCost + item.unitCost) / 2).toLocaleString('id-ID')}</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-muted-foreground">Impact</p>
                            <p className={cn("text-xs font-black", item.priceChange > 0 ? "text-red-600 text-[9px] underline underline-offset-2 decoration-red-200" : "text-green-600")}>
                              {item.priceChange > 0 ? "Margin akan turun" : "Margin menyempit"}
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
                className="w-full h-12 font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
                disabled={isSubmitting || items.length === 0 || !supplier}
              >
                {isSubmitting ? "Processing..." : "Konfirmasi & Update Stok"}
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 text-amber-800 dark:text-amber-200 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" /> Tips Kulakan
            </p>
            <p className="text-[11px] leading-relaxed font-medium"> Jika harga unit naik lebih dari 10%, sistem merekomendasikan untuk menghitung ulang harga jual agar margin tetap sehat (&gt;30%).</p>
          </div>
        </div>
      </form>
    </div>
  );
}
