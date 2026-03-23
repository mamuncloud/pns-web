import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import { dummyProducts } from "@/lib/data/products";

export const metadata = {
  title: "Produk | Planet Nyemil Snack",
  description: "Daftar lengkap produk snack Planet Nyemil Snack (PNS).",
};

export default function ProductsPage() {
  const pedasProducts = dummyProducts.filter(p => p.taste.includes("Pedas"));
  const gurihProducts = dummyProducts.filter(p => p.taste.includes("Gurih"));
  const manisProducts = dummyProducts.filter(p => p.taste.includes("Manis"));

  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-32 pb-32 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Promo Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary to-[#FF8A65] p-10 mb-12 flex flex-col md:flex-row items-center justify-between text-white shadow-xl">
            <div className="z-10 relative">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold mb-4">
                🔥 Promo Spesial Bulan Ini
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-black mb-4 tracking-tight">
                Diskon 20% Untuk Semua Produk "Pedas"
              </h1>
              <p className="text-lg text-white/90 font-medium">
                Gunakan kode <strong className="bg-white text-primary px-2 py-0.5 rounded ml-1">PEDASGILA20</strong> saat checkout!
              </p>
            </div>
            {/* Abstract decoration */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute right-10 -bottom-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline text-4xl font-extrabold text-dark tracking-tight mb-2">
              Katalog Produk
            </h2>
            <p className="text-on-background/60 font-medium text-lg">
              Eksplorasi berbagai rasa snack favoritmu
            </p>
          </div>

          {/* Categories Tabs */}
          <Tabs defaultValue="semua" className="w-full">
            <TabsList className="mb-10 p-1.5 bg-[#f6f6f6] rounded-full inline-flex w-full md:w-auto h-auto overflow-x-auto shadow-inner hide-scrollbar">
              <TabsTrigger 
                value="semua" 
                className="rounded-full px-6 py-3 font-bold text-sm md:text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all w-full md:w-auto flex-shrink-0"
              >
                Semua Rasa
              </TabsTrigger>
              <TabsTrigger 
                value="pedas" 
                className="rounded-full px-6 py-3 font-bold text-sm md:text-base data-[state=active]:bg-[#C62828] data-[state=active]:text-white transition-all w-full md:w-auto flex-shrink-0"
              >
                🔥 Pedas
              </TabsTrigger>
              <TabsTrigger 
                value="gurih" 
                className="rounded-full px-6 py-3 font-bold text-sm md:text-base data-[state=active]:bg-[#F57F17] data-[state=active]:text-white transition-all w-full md:w-auto flex-shrink-0"
              >
                🧀 Gurih
              </TabsTrigger>
              <TabsTrigger 
                value="manis" 
                className="rounded-full px-6 py-3 font-bold text-sm md:text-base data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white transition-all w-full md:w-auto flex-shrink-0"
              >
                🍯 Manis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="semua" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {dummyProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pedas" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {pedasProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {pedasProducts.length === 0 && (
                  <div className="col-span-full py-10 text-center text-dark/50 font-medium">Belum ada produk pedas.</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gurih" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {gurihProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {gurihProducts.length === 0 && (
                  <div className="col-span-full py-10 text-center text-dark/50 font-medium">Belum ada produk gurih.</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manis" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {manisProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {manisProducts.length === 0 && (
                  <div className="col-span-full py-10 text-center text-dark/50 font-medium">Belum ada produk manis.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
