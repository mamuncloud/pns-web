"use client";

import { useEffect, useState, use } from "react";
import { getProductById } from "@/lib/products-db";
import { Product, EnumTaste } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  TrendingUp, 
  Lightbulb,
  Image as ImageIcon,
  Package,
  Layers,
  Tag,
  Plus,
  Scissors
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
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockMovementList } from "@/components/dashboard/stock/StockMovementList";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const p = await getProductById(resolvedParams.id);
      setProduct(p);
      setIsLoading(false);
    }
    fetchProduct();
  }, [resolvedParams.id]);

  if (isLoading) {
    return <div className="p-10 text-center font-bold animate-pulse text-muted-foreground uppercase tracking-widest text-sm">Memuat detail produk...</div>;
  }

  if (!product) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-xl font-black text-foreground uppercase">Produk tidak ditemukan</p>
        <Link href="/dashboard/products">
          <Button variant="outline" className="font-bold uppercase tracking-wider">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: product.imageUrl || getProductImageUrl(null), id: 'default', isPrimary: true }];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-6">
        <Breadcrumbs 
          items={[
            { label: "Products", href: "/dashboard/products" },
            { label: product.name }
          ]} 
        />
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
               <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-sm">
                 {product.brand?.name || "No Brand"}
               </Badge>
               <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">
                 ID: {product.id.split('-')[0]}
               </span>
            </div>
            <h2 className="text-6xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent leading-[0.85]">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 mt-4">
               <div className="flex flex-wrap gap-2">
                 {product.taste.map((t: EnumTaste, i: number) => (
                   <span key={i} className="text-[10px] font-black text-primary/70 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 shadow-sm animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 100}ms` }}>#{t}</span>
                 ))}
               </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="ml-auto flex items-center gap-3">
            <Link href={`/dashboard/repacks?productId=${product.id}`}>
              <Button
                id="btn-pecah-produk"
                variant="outline"
                className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all gap-3 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm group"
              >
                <Scissors className="h-5 w-5 transition-transform group-hover:rotate-12 duration-300" />
                Pecah Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">

          <Tabs defaultValue="variants" className="w-full space-y-6">
            <TabsList className="h-14 bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-2xl w-full justify-start overflow-x-auto space-x-2">
              <TabsTrigger value="variants" className="rounded-xl px-8 h-full text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all">
                Daftar Varian
              </TabsTrigger>
              <TabsTrigger value="ledger" className="rounded-xl px-8 h-full text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all">
                Riwayat Stok
              </TabsTrigger>
            </TabsList>

            <TabsContent value="variants" className="m-0 border-none outline-none">
              {/* Variants Table */}
              <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-2xl overflow-hidden bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl rounded-[2.5rem] border-none shadow-gray-200/50 dark:shadow-none">
            <CardHeader className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-900/50 dark:to-transparent border-b border-gray-100/50 dark:border-gray-800/50 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Varian Produk</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Rincian stok dan harga jual secara realtime.</CardDescription>
                </div>
                <Button className="h-14 px-8 rounded-2xl font-black text-[12px] uppercase tracking-widest bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all hover:scale-[1.05] active:scale-[0.95] border-none group">
                  <Plus className="h-5 w-5 mr-2 stroke-[4] group-hover:rotate-90 transition-transform duration-300" />
                  Tambah Varian
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/30 dark:bg-gray-900/10 border-b border-gray-100/50 dark:border-gray-800/50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-primary/50" />
                          Packaging
                        </div>
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3 w-3 text-primary/50" />
                          Qty Stok
                        </div>
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 text-primary/50" />
                          Harga Jual
                        </div>
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-primary/50" />
                          Ukuran
                        </div>
                      </th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50 dark:divide-gray-900/50">
                    {product.variants.map((v, idx: number) => (
                      <tr key={idx} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-500 group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{v.package}</span>
                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.15em] flex items-center gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-primary/20" />
                              SKU: PN-{v.package.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100/50 dark:border-gray-800/50 transition-all group-hover:border-primary/20">
                             <div className={cn(
                               "h-2.5 w-2.5 rounded-full",
                               (v.stock || 0) > 10 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : (v.stock || 0) > 0 ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                             )} />
                             <div className="flex flex-col">
                               <span className={cn(
                                 "text-xl font-black tracking-tighter leading-none",
                                 (v.stock || 0) <= 5 ? "text-red-500" : "text-foreground"
                               )}>{v.stock || 0}</span>
                               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Qty Unit</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xl font-black text-foreground tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{formatCurrency(v.price)}</span>
                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest pl-0.5">Price Per {v.package}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {v.sizeInGram ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/10 border border-amber-500/20">
                              <span className="text-base font-black text-amber-600 dark:text-amber-400 tracking-tighter">{v.sizeInGram}</span>
                              <span className="text-[9px] font-black text-amber-600/60 dark:text-amber-500/70 uppercase tracking-widest">gram</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-widest">—</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-gray-100 dark:border-gray-800 text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="ledger" className="m-0 border-none outline-none">
            <StockMovementList productId={product.id} className="rounded-[2.5rem] border-none shadow-2xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl" />
          </TabsContent>
        </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Image Display */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-950 rounded-3xl group">
            <CardContent className="p-0">
              {images.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image, index) => (
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
          <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-2xl overflow-hidden bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl rounded-[2.5rem] border-none">
            <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 p-8 bg-gray-50/20 dark:bg-gray-900/10">
              <CardTitle className="text-[11px] font-black flex items-center gap-3 text-foreground uppercase tracking-[0.25em]">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-amber-500 animate-pulse" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10 flex-grow">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 flex items-center gap-2">
                   <TrendingUp className="h-3 w-3" /> Sumber Supplier
                </p>
                <div className="p-5 rounded-3xl bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10 group cursor-default transition-all hover:bg-primary/[0.06] shadow-sm">
                   <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mb-1.5">Latest Purchase From:</p>
                   <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                     {product.latestSupplier?.name || "Belum Ada Pembelian"}
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Deskripsi Produk</p>
                <div className="relative">
                  <div className="absolute -left-3 top-0 h-full w-1 bg-primary/10 rounded-full" />
                  <p className="text-sm text-foreground/80 leading-relaxed font-semibold italic pl-2">
                    &quot;{product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}&quot;
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Profile Rasa</p>
                <div className="flex flex-wrap gap-2.5">
                  {product.taste.map((t: EnumTaste, idx: number) => (
                    <Badge key={idx} variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-4 py-1.5 bg-gray-100 dark:bg-gray-800/80 text-foreground/70 border-none rounded-xl shadow-sm hover:scale-105 transition-transform">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Analytics */}
          <div className="grid grid-cols-1 gap-4">
             <Card className="border-none shadow-2xl shadow-indigo-500/10 bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-900 rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute right-[-10%] top-[-10%] p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                   <TrendingUp className="h-40 w-40 text-white" />
                </div>
                <CardContent className="p-10 flex flex-col justify-between relative z-10 min-h-[180px]">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-100/60 uppercase tracking-[0.3em]">Stock Inventory</p>
                    <p className="text-5xl font-black text-white tracking-tighter">
                      {product.stockQty?.toLocaleString('id-ID') || 0}
                      <span className="text-[10px] ml-2 opacity-60 uppercase tracking-widest font-black">Total Pcs</span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <Badge className="font-black text-[9px] uppercase tracking-[0.2em] bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-xl border-none shadow-xl">
                      Live Inventory Status
                    </Badge>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
