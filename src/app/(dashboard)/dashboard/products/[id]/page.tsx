"use client";

import { useEffect, useState, use } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  TrendingUp, 
  History, 
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const { data } = await getProductsFromDb(1, 100);
      const p = data.find(item => item.id === resolvedParams.id);
      setProduct(p || null);
      setIsLoading(false);
    }
    fetchProduct();
  }, [resolvedParams.id]);

  if (isLoading) {
    return <div className="p-10 text-center font-bold animate-pulse">Memuat detail produk...</div>;
  }

  if (!product) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-xl font-bold">Produk tidak ditemukan</p>
        <Link href="/dashboard/products">
          <Button variant="outline">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">{product.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            ID: <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{product.id}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            {product.taste.join(', ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Variants Table */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black">Varian Produk</CardTitle>
              <CardDescription>Rincian harga per kemasan.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Packaging</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Harga Jual</th>
                      <th className="px-6 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {product.variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-bold border-gray-200">{v.package}</Badge>
                        </td>
                        <td className="px-6 py-4 font-black">Rp {v.price.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="font-bold text-xs">Edit Harga</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* History Panel */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Activity History
                  </CardTitle>
                  <CardDescription>Catatan perubahan produk.</CardDescription>
                </div>
              </CardHeader>
             <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "24 Mar 2026", type: "HPP", old: "Rp 12.000", new: "Rp 13.500", change: "+12.5%", isUp: true },
                    { date: "15 Feb 2026", type: "Sell Price", old: "Rp 18.000", new: "Rp 20.000", change: "+11.1%", isUp: true },
                    { date: "10 Jan 2026", type: "HPP", old: "Rp 11.500", new: "Rp 12.000", change: "+4.3%", isUp: true },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-black text-muted-foreground uppercase leading-tight">
                          {log.date.split(' ').map((s, i) => <div key={i}>{s}</div>)}
                        </div>
                        <div className="h-full w-px bg-gray-200" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{log.type}</p>
                          <p className="text-sm font-bold text-foreground">{log.old} → {log.new}</p>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1 font-black text-sm", log.isUp ? "text-red-600" : "text-green-600")}>
                        {log.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                        {log.change}
                      </div>
                    </div>
                  ))}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Insight Panel */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-foreground uppercase tracking-wider">
                <Lightbulb className="h-4 w-4 text-primary" />
                Informasi Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Deskripsi</p>
                <p className="text-sm text-foreground leading-relaxed">{product.description || 'Tidak ada deskripsi.'}</p>
              </div>
              
              <div className="p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Taste Profile</p>
                <div className="flex flex-wrap gap-2">
                  {product.taste.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="font-bold">{t}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
             <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Variants</p>
                    <p className="text-lg font-black text-foreground">{product.variants.length} Varian</p>
                  </div>
                  <Badge variant="outline" className="font-bold">Active</Badge>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
