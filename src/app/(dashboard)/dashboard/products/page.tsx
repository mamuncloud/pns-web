"use client";

import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  ArrowUpRight, 
  TrendingDown, 
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Filter
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data } = await getProductsFromDb(1, 100);
      setProducts(data);
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Kelola Produk</h2>
          <p className="text-muted-foreground">Monitoring HPP, margin, dan kesehatan stok secara real-time.</p>
        </div>
        <Button className="font-bold gap-2">
          <Package className="h-4 w-4" />
          Tambah Produk Baru
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama produk..." 
            className="pl-10 h-11 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 gap-2 border-gray-200 dark:border-gray-800 font-bold">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Produk</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Harga Jual</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">HPP</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Margin %</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right flex justify-end"><p className="sr-only">Aksi</p></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center animate-pulse">
                    <p className="font-bold text-muted-foreground">Memuat data produk...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="font-bold text-muted-foreground">Produk tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const avgPrice = product.variants.length > 0 
                    ? product.variants.reduce((acc, v) => acc + v.price, 0) / product.variants.length 
                    : 0;
                  const hpp = product.hpp || avgPrice * 0.7; // Mock fallback
                  const margin = product.margin || ((avgPrice - hpp) / avgPrice) * 100;
                  
                  const statusColor = margin < 15 ? "text-red-600 bg-red-50 dark:bg-red-500/10" : 
                                     margin < 25 ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10" : 
                                     "text-green-600 bg-green-50 dark:bg-green-500/10";
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden")}>
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} width={40} height={40} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{product.taste.join(', ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-foreground">
                          {avgPrice > 0 ? `Rp ${avgPrice.toLocaleString('id-ID')}` : '-'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{product.variants.length} Varian</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-muted-foreground">
                          Rp {hpp.toLocaleString('id-ID')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={cn("inline-flex items-center gap-1 font-black text-sm", margin < 15 ? "text-red-600" : "text-green-600")}>
                          {margin < 15 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          {margin.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={cn("bg-transparent border shadow-none px-2 py-0 text-[10px] font-black uppercase tracking-tighter", statusColor)}>
                          {margin < 15 ? "Low Margin" : margin < 25 ? "Warning" : "Healthy"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insight Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/20">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-red-600/70">Margin Warning</p>
              <p className="text-lg font-black text-foreground">3 Produk</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50/10 dark:border-amber-900/20 dark:bg-amber-900/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-600/70">Harga Belum Update</p>
              <p className="text-lg font-black text-foreground">12 Varian</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/10 dark:border-green-900/20 dark:bg-green-900/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-green-600/70">Avg. Shop Margin</p>
              <p className="text-lg font-black text-foreground">32.4%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
