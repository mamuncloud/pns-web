"use client";

import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  ArrowUpRight, 
  MoreVertical,
  Filter
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductCreateDialog } from "@/components/dashboard/products/ProductCreateDialog";

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
        <ProductCreateDialog />
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
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Varian</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Deskripsi</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right flex justify-end"><p className="sr-only">Aksi</p></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center animate-pulse">
                    <p className="font-bold text-muted-foreground">Memuat data produk...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="font-bold text-muted-foreground">Produk tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
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
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">{product.taste.join(', ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-foreground">
                          {product.variants.length} Varian
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.variants.map(v => v.package).join(', ')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description || "-"}
                        </p>
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

    </div>
  );
}
