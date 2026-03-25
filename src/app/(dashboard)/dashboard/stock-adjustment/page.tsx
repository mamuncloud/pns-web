"use client";

import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  History, 
  PackageCheck, 
  CheckCircle2,
  RefreshCcw,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const adjustmentReasons = [
  { id: "defect", label: "Rusak (Defect)", color: "bg-red-500" },
  { id: "expired", label: "Kadaluwarsa (Expired)", color: "bg-amber-500" },
  { id: "lost", label: "Hilang", color: "bg-gray-500" },
];

export default function StockAdjustmentPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState<number>(0);
  const [reason, setReason] = useState<string>("defect");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await getProductsFromDb(1, 100);
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const hpp = selectedProduct?.hpp || (selectedProduct?.variants[0]?.price || 0) * 0.7;
  const estimatedLoss = qty * hpp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || qty <= 0) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Adjustment submitted: ${selectedProduct.name} - ${qty} units (${reason})`);
    
    // Reset form
    setSelectedProduct(null);
    setQty(0);
    setReason("defect");
    setNote("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">Penyesuaian Stok</h2>
        <p className="text-muted-foreground">Kelola barang tidak layak jual (defect, expired, atau hilang).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adjustment Form */}
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-primary" />
              Input Penyesuaian
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pilih Produk</label>
                  <select 
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={selectedProduct?.id || ""}
                    onChange={(e) => {
                      const p = products.find(p => p.id === e.target.value);
                      setSelectedProduct(p || null);
                    }}
                    required
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Jumlah (Qty)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={qty || ""}
                    onChange={(e) => setQty(Number(e.target.value))}
                    placeholder="Masukkan jumlah..."
                    className="h-11 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alasan Penyesuaian</label>
                <div className="grid grid-cols-3 gap-3">
                  {adjustmentReasons.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReason(r.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                        reason === r.id 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-100 bg-transparent text-muted-foreground hover:border-gray-200"
                      )}
                    >
                      <div className={cn("h-4 w-4 rounded-full", r.color)} />
                      <span className="text-[11px] font-black uppercase tracking-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Keterangan (Opsional)</label>
                <textarea 
                  className="w-full h-24 px-4 py-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-800 font-medium text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  placeholder="Contoh: Plastik sobek saat bongkar muat..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 font-black uppercase tracking-widest text-sm"
                disabled={isSubmitting || !selectedProduct || qty <= 0}
              >
                {isSubmitting ? "Memproses..." : "Submit Penyesuaian"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Real-time Insight */}
        <div className="space-y-8">
          <Card className="border-red-200 bg-red-50/20 dark:border-red-900/40 dark:bg-red-900/10 shadow-sm border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-red-600 uppercase tracking-widest">
                <AlertTriangle className="h-4 w-4" />
                Real-time Loss Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground">Estimasi Kerugian</p>
                <p className="text-3xl font-black text-foreground">
                  Rp {estimatedLoss.toLocaleString('id-ID')}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                Kerugian dihitung berdasarkan HPP rata-rata unit ({selectedProduct ? `Rp ${hpp?.toLocaleString('id-ID')}` : '-'}) dikalikan dengan jumlah unit yang disesuaikan.
              </p>
              {qty > 5 && (
                <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                  <Badge variant="destructive" className="h-4 w-4 rounded-full p-0 flex items-center justify-center font-bold">!</Badge>
                  <p className="text-[10px] font-black text-red-800 dark:text-red-200 uppercase tracking-tighter">High loss amount detected!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center dark:bg-orange-900/30 text-orange-600">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-600/70">Warning Stock</p>
                <p className="text-sm font-bold text-foreground">5 Produk Menipis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History View */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-800/50">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <History className="h-5 w-5 text-muted-foreground" />
              Riwayat Penyesuaian
            </CardTitle>
            <CardDescription>Daftar 10 koreksi stok terakhir.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="font-bold gap-1 text-primary">
            Lihat Laporan Lengkap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waktu</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Produk</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Qty</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Alasan</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right font-black">Kerugian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { time: "Tadi, 10:45", product: "Keripik Singkong", qty: 2, reason: "defect", loss: "Rp 24.000", badgeColor: "bg-red-500" },
                  { time: "24 Mar, 15:20", product: "Basreng Pedas", qty: 1, reason: "expired", loss: "Rp 10.500", badgeColor: "bg-amber-500" },
                  { time: "22 Mar, 09:12", product: "Makaroni Bantet", qty: 5, reason: "lost", loss: "Rp 60.000", badgeColor: "bg-gray-500" },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground">{item.time}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{item.product}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-sm">-{item.qty}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", item.badgeColor)} />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{item.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-red-600">{item.loss}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Education Toast/Alert (Simulated) */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium leading-relaxed">
          <strong>Tip Profit:</strong> Selalu catat setiap barang rusak agar perhitungan margin Anda tetap akurat. Transparansi terhadap kerugian (loss) adalah langkah pertama menuju profit yang sehat!
        </p>
      </div>
    </div>
  );
}
