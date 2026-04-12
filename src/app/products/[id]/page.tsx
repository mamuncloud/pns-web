import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductById } from "@/lib/products-db";
import { getProductImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnumTaste } from "@/types/product";
import ProductOrderClient from "./ProductOrderClient";

const tasteColors: Record<EnumTaste | string, string> = {
  Pedas: "bg-[#C62828] text-white hover:bg-[#B71C1C]",
  Gurih: "bg-[#F57F17] text-white hover:bg-[#E65100]",
  Manis: "bg-[#4CAF50] text-white hover:bg-[#388E3C]",
};

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await getProductById(params.id);
  
  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | Planet Nyemil Snack",
    };
  }

  return {
    title: `${product.name} | Planet Nyemil Snack`,
    description: product.description || `Pesan ${product.name} rasa otentik dari Planet Nyemil Snack.`,
  };
}

export default async function PublicProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const product = await getProductById(params.id);

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-32 min-h-[70vh] flex flex-col items-center justify-center px-6">
          <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-muted-foreground">inventory_2</span>
          </div>
          <h1 className="font-headline font-black text-3xl mb-2 text-dark dark:text-white text-center">Produk Tidak Ditemukan</h1>
          <p className="text-on-background/60 dark:text-zinc-400 text-center mb-8 max-w-md">
            Maaf, produk yang Anda cari mungkin sudah dihapus atau link tidak valid.
          </p>
          <Link href="/products" className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            Kembali ke Katalog
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Get images, default to standard image if none
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.url)
    : [product.imageUrl || getProductImageUrl(null)];
    
  const primaryImage = images[0];

  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-32 pb-24 md:pb-32 min-h-screen bg-[#fcfcfc] dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Breadcrumb & Global Back */}
          <div className="mb-8">
            <Link href="/products" className="inline-flex items-center gap-2 text-on-background/60 dark:text-zinc-400 hover:text-primary transition-colors font-medium text-sm">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Katalog Produk
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Left: Product Images Gallery */}
            <div className="lg:col-span-6 lg:top-32 h-fit">
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-2 border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-muted/30">
                  <Image 
                    src={primaryImage || getProductImageUrl(null)} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {product.taste.length > 0 && (
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                      {product.taste.map((t, idx) => (
                        <Badge key={`${t}-${idx}`} className={`${tasteColors[t as string] || "bg-primary text-white"} font-bold px-4 py-1.5 shadow-xl border-0 text-xs tracking-wider rounded-xl w-fit drop-shadow-md`}>
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-all bg-white dark:bg-zinc-900 shadow-sm">
                      <Image 
                        src={img} 
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Order Action */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              
              {/* Product Header */}
              <div className="mb-6">
                <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl text-dark dark:text-white leading-[1.1] tracking-tighter mb-4">
                  {product.name}
                </h1>
                
                {product.status === "Critical" && (
                  <Badge variant="destructive" className="mb-4">Stok Menipis</Badge>
                )}
              </div>

              {/* Interactive Client Component First (Price, Variants, Cart) */}
              <ProductOrderClient product={product} />

              <hr className="border-border border-dashed my-8" />

              {/* Description Wrapper Below Action */}
              <div className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-p:text-on-background/70 dark:prose-p:text-zinc-400 max-w-none pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-dark dark:text-white/80 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span> Detail Produk
                </h3>
                <p className="text-base font-medium">
                  {product.description || "Tidak ada deskripsi rinci untuk produk ini. Hubungi admin untuk detail lebih lanjut."}
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
