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
  Lightbulb,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { cn, getProductImageUrl } from "@/lib/utils";
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
    return <div className="p-10 text-center font-bold animate-pulse text-muted-foreground uppercase tracking-widest">Memuat detail produk...</div>;
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="text-lg font-black uppercase tracking-wider">Varian Produk</CardTitle>
              <CardDescription>Rincian harga per kemasan.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Packaging</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Harga Jual</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {product.variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all duration-200">
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-bold border-gray-200 text-xs py-1 transition-colors hover:border-primary hover:text-primary">{v.package}</Badge>
                        </td>
                        <td className="px-6 py-4 font-black text-base">Rp {v.price.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:text-primary">Edit Harga</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* History Panel */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-800">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-wider">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Activity History
                  </CardTitle>
                  <CardDescription>Catatan perubahan produk.</CardDescription>
                </div>
              </CardHeader>
             <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { date: "24 Mar 2026", type: "HPP", old: "Rp 12.000", new: "Rp 13.500", change: "+12.5%", isUp: true },
                    { date: "15 Feb 2026", type: "Sell Price", old: "Rp 18.000", new: "Rp 20.000", change: "+11.1%", isUp: true },
                    { date: "10 Jan 2026", type: "HPP", old: "Rp 11.500", new: "Rp 12.000", change: "+4.3%", isUp: true },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 transition-all hover:translate-x-1 duration-300">
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-black text-muted-foreground uppercase leading-tight bg-white dark:bg-gray-900 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                          {log.date.split(' ').map((s, i) => <div key={i}>{s}</div>)}
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{log.type}</p>
                          <p className="text-sm font-bold text-foreground">{log.old} → {log.new}</p>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1 font-black text-sm px-2.5 py-1 rounded-full", log.isUp ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "text-green-600 bg-green-50 dark:bg-green-900/20")}>
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
          {/* Image Display */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-md overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm group">
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
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CarouselPrevious className="relative left-0 translate-y-0 h-9 w-9 bg-white/80 dark:bg-black/50 backdrop-blur-md border-none shadow-lg hover:bg-white dark:hover:bg-black" />
                    <CarouselNext className="relative right-0 translate-y-0 h-9 w-9 bg-white/80 dark:bg-black/50 backdrop-blur-md border-none shadow-lg hover:bg-white dark:hover:bg-black" />
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md">
                    {images.map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    ))}
                  </div>
                </Carousel>
              ) : (
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <Image
                    src={images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
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
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-foreground uppercase tracking-widest">
                <Lightbulb className="h-4 w-4 text-primary animate-pulse" />
                Informasi Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deskripsi</p>
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">{product.description || 'Tidak ada deskripsi.'}</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taste Profile</p>
                <div className="flex flex-wrap gap-2">
                  {product.taste.map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-none">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
             <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-black/40 dark:to-gray-900/20 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Variants</p>
                    <p className="text-xl font-black text-foreground tracking-tight">{product.variants.length} Varian</p>
                  </div>
                  <Badge className="font-black text-[10px] uppercase tracking-widest bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/30 px-3 py-1">Active</Badge>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
