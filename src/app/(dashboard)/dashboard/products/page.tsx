"use client";

import { useDebounce } from "@/hooks/use-debounce";
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
  Filter,
  Scissors,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductCreateDialog } from "@/components/dashboard/products/ProductCreateDialog";
import { Badge } from "@/components/ui/badge";
import { ProductEditDialog } from "@/components/dashboard/products/ProductEditDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback, useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationMeta } from "@/lib/products-db";

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [filterTaste, setFilterTaste] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<string>("stock");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const refreshProducts = useCallback(async (page = currentPage) => {
    // Avoid synchronous setState in effect (cascading renders)
    await Promise.resolve();
    setIsLoading(true);
    const { data, meta: paginationMeta } = await getProductsFromDb(
      page, 
      pageSize,
      filterTaste === "Semua" ? undefined : filterTaste,
      debouncedSearch || undefined,
      undefined,
      sortBy,
      sortOrder
    );
    setProducts(data);
    setMeta(paginationMeta);
    setIsLoading(false);
  }, [currentPage, pageSize, filterTaste, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    // Wrap in setTimeout to avoid the cascading render warning
    const timer = setTimeout(() => {
      void refreshProducts(currentPage);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage, refreshProducts]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      // Reset to page 1 when searching
      if (currentPage !== 1 && debouncedSearch) {
        setCurrentPage(1);
        return;
      }
      
      const { data, meta: paginationMeta } = await getProductsFromDb(
        currentPage, 
        pageSize, 
        filterTaste === "Semua" ? undefined : filterTaste, 
        debouncedSearch || undefined,
        undefined,
        sortBy,
        sortOrder
      );
      if (!cancelled) {
        setProducts(data);
        setMeta(paginationMeta);
        setIsLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [debouncedSearch, currentPage, pageSize, filterTaste, sortBy, sortOrder]);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Katalog Produk</h2>
          <p className="text-sm text-muted-foreground font-medium">Kelola data master produk, brand, rasa, dan definisi varian.</p>
        </div>
        <ProductCreateDialog />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari nama produk..." 
            className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => {
            const [by, order] = (val || "stock-desc").split('-');
            setSortBy(by);
            setSortOrder(order as "asc" | "desc");
          }}>
            <SelectTrigger className="w-[180px] h-14 rounded-2xl bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all focus:ring-primary/20">
              <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <ArrowUpDown className="h-4 w-4" />
              </div>
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stock-desc">Stok Terbanyak</SelectItem>
              <SelectItem value="stock-asc">Stok Tersedikit</SelectItem>
              <SelectItem value="createdAt-desc">Paling Baru</SelectItem>
              <SelectItem value="createdAt-asc">Paling Lama</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTaste} onValueChange={(val) => setFilterTaste(val || "Semua")}>
            <SelectTrigger className="w-[160px] h-14 rounded-2xl bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all focus:ring-primary/20">
              <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
              </div>
              <SelectValue placeholder="Semua Rasa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Rasa</SelectItem>
              <SelectItem value="GURIH">Gurih</SelectItem>
              <SelectItem value="PEDAS">Pedas</SelectItem>
              <SelectItem value="MANIS">Manis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Produk</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-center">Varian</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Deskripsi</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center animate-pulse">
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/30">Memuat data produk...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Produk tidak ditemukan</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  return (
                    <tr key={product.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300 group">
                      <td className="px-8 py-6">
                        <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-4 group/item">
                          <div className={cn(
                            "h-14 w-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 shadow-sm group-hover/item:shadow-md group-hover/item:border-primary/20 transition-all duration-500"
                          )}>
                            {product.imageUrl ? (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                width={56} 
                                height={56} 
                                className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-700" 
                                unoptimized
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="space-y-1">
                            {product.brand && (
                              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/70 leading-none mb-0.5">
                                {product.brand.name}
                              </p>
                            )}
                            <p className="text-base font-black text-foreground tracking-tight group-hover/item:text-primary transition-colors leading-tight">{product.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {product.taste.map(t => (
                                <span key={t} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-muted-foreground border border-gray-200/50 dark:border-gray-700/50">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <Badge variant="outline" className="h-7 px-3 rounded-xl border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-tight">
                            {product.variants.length} Varian
                          </Badge>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                            {product.variants.map(v => v.package).slice(0, 3).join(', ')}{product.variants.length > 3 && '...'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-[300px]">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                            {product.description || "Tidak ada deskripsi tersedia untuk produk ini."}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 translate-x-0 xl:translate-x-2 xl:group-hover:translate-x-0 transition-all duration-300">
                          <Link href={`/dashboard/repacks?productId=${product.id}`}>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all" title="Pecah Produk">
                              <Scissors className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all" title="Detail Produk">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition-all"
                            title="Edit Produk"
                            onClick={() => setEditingProduct(product)}
                          >
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

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  href="#"
                />
              </PaginationItem>
              
              {Array.from({ length: meta.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Simple pagination logic: show current, first, last, and neighbors
                if (
                  pageNum === 1 || 
                  pageNum === meta.totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        href="#"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                  className={cn(currentPage === meta.totalPages && "pointer-events-none opacity-50")}
                  href="#"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {editingProduct && (
        <ProductEditDialog
          product={editingProduct}
          open={Boolean(editingProduct)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProduct(null);
            }
          }}
          onSuccess={async () => {
            await refreshProducts();
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
