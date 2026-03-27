"use client";

import { useEffect, useState, use } from "react";
import { getProductInventory, ProductInventory, InventoryBatch } from "@/lib/inventory-db";
import { EnumTaste } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  TrendingUp, 
  Lightbulb,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { cn, getProductImageUrl, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<ProductInventory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      setIsLoading(true);
      try {
        const response = await getProductInventory(resolvedParams.id);
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch product inventory:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInventory();
  }, [resolvedParams.id]);

  if (isLoading) {
    return <div className="p-10 text-center font-bold animate-pulse text-muted-foreground uppercase tracking-widest text-sm">Memuat detail produk...</div>;
  }

  if (!data || !data.product) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-xl font-black text-foreground uppercase">Produk tidak ditemukan</p>
        <Link href="/dashboard/inventory">
          <Button variant="outline" className="font-bold uppercase tracking-wider">Kembali ke Inventaris</Button>
        </Link>
      </div>
    );
  }

  const product = data.product;
  const batches = data.batches;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: product.imageUrl || getProductImageUrl(null), id: 'default', isPrimary: true }];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-md">
               {product.brand?.name || "No Brand"}
             </Badge>
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
               ID: {product.id.split('-')[0]}...
             </span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">{product.name}</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex gap-2">
               {product.taste.map((t: EnumTaste, i: number) => (
                 <span key={i} className="text-[10px] font-bold text-muted-foreground/60 uppercase">#{t}</span>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Variants Table Grouping */}
          <div className="space-y-6">
            {Object.entries(
              batches.reduce((acc, b) => {
                const price = b.price;
                if (!acc[price]) acc[price] = [];
                acc[price].push(b);
                return acc;
              }, {} as Record<number, typeof batches>)
            ).sort(([priceA], [priceB]) => Number(priceA) - Number(priceB)).map(([price, variants]) => (
              <Card key={price} className="border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-3xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-transparent border-b border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Varian {formatCurrency(Number(price))}</CardTitle>
                      </div>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {variants.length} Varian tersedia dengan harga ini.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Packaging</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Batch Info</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Expired Date</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Sisa Hari</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Qty Stok</th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                        {variants.map((v: InventoryBatch, idx: number) => (
                          <tr key={v.id || idx} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300 group">
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground uppercase tracking-tight">{v.label}</span>
                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">BATCH ID: {v.id.split('-')[0]}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-foreground uppercase tracking-tight">
                                  {v.supplierName || "STOK AWAL / MANUAL"}
                                </span>
                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                  Arrived: {v.purchaseDate ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(v.purchaseDate)) : "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {v.expiredDate ? (
                                <div className="flex flex-col items-center">
                                  <span className={cn(
                                    "text-xs font-black uppercase tracking-tight",
                                    new Date(v.expiredDate) < new Date() ? "text-red-500" : "text-foreground"
                                  )}>
                                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(v.expiredDate))}
                                  </span>
                                  {new Date(v.expiredDate) < new Date() && (
                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Expired</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">-</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-center">
                              {typeof v.daysUntilExpiry === 'number' ? (
                                <div className="flex flex-col items-center">
                                  <span className={cn(
                                    "text-xs font-black uppercase tracking-tight",
                                    v.daysUntilExpiry <= 30 && v.daysUntilExpiry > 0 ? "text-amber-500" : 
                                    v.daysUntilExpiry <= 0 ? "text-red-500" : "text-emerald-500"
                                  )}>
                                    {v.daysUntilExpiry <= 0 ? "EXPIRED" : `${v.daysUntilExpiry} Hari`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">-</span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  (v.stock || 0) > 10 ? "bg-emerald-500" : (v.stock || 0) > 0 ? "bg-amber-500" : "bg-red-500"
                                )} />
                                <span className={cn(
                                  "text-lg font-black tracking-tight",
                                  (v.stock || 0) <= 5 ? "text-red-500" : "text-foreground"
                                )}>{v.stock || 0}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Unit</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 transition-all group-hover:translate-x-[-4px]">
                                Edit Stok
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Image Display */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-950 rounded-3xl group">
            <CardContent className="p-0">
              {images.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image: { url: string; id: string }, index: number) => (
                      <CarouselItem key={image.id || index}>
                        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                          <Image
                            src={image.url}
                            alt={`${product.name} - image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CarouselPrevious className="relative left-0 translate-y-0 h-10 w-10 bg-white/90 dark:bg-black/70 backdrop-blur-xl border-none shadow-2xl hover:bg-white dark:hover:bg-black cursor-pointer" />
                    <CarouselNext className="relative right-0 translate-y-0 h-10 w-10 bg-white/90 dark:bg-black/70 backdrop-blur-xl border-none shadow-2xl hover:bg-white dark:hover:bg-black cursor-pointer" />
                  </div>
                </Carousel>
              ) : (
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <Image
                    src={images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {!product.imageUrl && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 bg-black/5">
                        <ImageIcon className="h-12 w-12 mb-2 stroke-[1.5]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No primary image</span>
                     </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insight Panel */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-3xl flex flex-col">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-900/10">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-foreground uppercase tracking-[0.2em]">
                <Lightbulb className="h-4 w-4 text-amber-500 animate-pulse" />
                Informasi Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8 flex-grow">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                   <TrendingUp className="h-3 w-3" /> Sumber Supplier
                </p>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 group cursor-default">
                   <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 opacity-70">Latest Purchase From:</p>
                   <p className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                     {product.latestSupplier?.name || "Belum Ada Pembelian"}
                   </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Deskripsi Produk</p>
                <p className="text-sm text-foreground/70 leading-relaxed font-semibold italic">
                  &quot;{product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}&quot;
                </p>
              </div>
              
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Profile Rasa</p>
                <div className="flex flex-wrap gap-2">
                  {product.taste.map((t: EnumTaste, idx: number) => (
                    <Badge key={idx} variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-none rounded-lg">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Analytics */}
          <div className="grid grid-cols-1 gap-4">
             <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 backdrop-blur-md rounded-3xl overflow-hidden relative group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                   <TrendingUp className="h-16 w-16 text-indigo-500" />
                </div>
                <CardContent className="p-6 flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-500/70 uppercase tracking-[0.2em]">Total Inventory</p>
                    <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tighter">
                      {product.stockQty?.toLocaleString('id-ID') || 0}
                      <span className="text-xs ml-1 opacity-50 uppercase tracking-widest">Pcs</span>
                    </p>
                  </div>
                  <Badge className="font-black text-[10px] uppercase tracking-widest bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 px-4 py-1.5 rounded-xl border-none">
                    Inventory Status
                  </Badge>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
