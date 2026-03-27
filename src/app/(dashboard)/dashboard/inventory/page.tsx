"use client";

import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Box, 
  Search, 
  ArrowUpRight, 
  Filter,
  AlertTriangle,
  CheckCircle2,
  Package
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function DashboardInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const { data } = await getProductsFromDb(1, 100);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (qty: number = 0) => {
    if (qty <= 5) return { label: "Kritis", color: "text-red-600 bg-red-50 dark:bg-red-900/20", icon: AlertTriangle };
    if (qty <= 20) return { label: "Peringatan", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20", icon: AlertTriangle };
    return { label: "Aman", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Inventaris & Stok</h2>
          <p className="text-muted-foreground">Pantau level stok dan ketersediaan varian produk.</p>
        </div>
        <div className="flex items-center gap-2">
           <Link href="/dashboard/stock-adjustment">
            <Button variant="outline" className="h-11 font-bold border-gray-200 dark:border-gray-800">
              Penyesuaian Stok
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Box className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Produk</p>
              <p className="text-2xl font-black text-foreground">{products.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Stok Rendah</p>
              <p className="text-2xl font-black text-foreground">
                {products.filter(p => (p.stockQty || 0) <= 20).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Stok Aman</p>
              <p className="text-2xl font-black text-foreground">
                {products.filter(p => (p.stockQty || 0) > 20).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari produk atau varian..." 
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

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Produk</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Stok Total</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right flex justify-end"><p className="sr-only">Aksi</p></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center animate-pulse">
                    <p className="font-bold text-muted-foreground">Memuat data inventaris...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="font-bold text-muted-foreground">Data tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stockQty || 0);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden")}>
                            {product.imageUrl ? (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                width={40} 
                                height={40} 
                                className="h-full w-full object-cover" 
                                unoptimized
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                              {product.variants.length} Varian
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className={cn("text-lg font-black", 
                          (product.stockQty || 0) <= 5 ? "text-red-600" : "text-foreground"
                        )}>
                          {product.stockQty || 0}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary transition-transform group-hover:scale-110">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
