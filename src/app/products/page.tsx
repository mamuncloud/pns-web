import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import { getProductsFromDb } from "@/lib/products-db";
import ProductPagination from "@/components/ProductPagination";
import Link from "next/link";

export const metadata = {
  title: "Produk | Planet Nyemil Snack",
  description: "Daftar lengkap produk snack Planet Nyemil Snack (PNS).",
};

export default async function ProductsPage(props: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const activeTab = searchParams.tab || "semua";
  
  // Map tab to taste filter for backend
  const tasteMap: Record<string, string | undefined> = {
    semua: undefined,
    pedas: "Pedas",
    gurih: "Gurih",
    manis: "Manis",
  };
  
  const tasteFilter = tasteMap[activeTab];
  
  // Fetch paginated products from DB
  const { data: products, meta } = await getProductsFromDb(page, 12, tasteFilter);

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
                Diskon 20% Untuk Semua Produk &quot;Pedas&quot;
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

          {/* Categories Tabs as Links for Search SEO and Pagination logic */}
          <div className="w-full mb-10">
            <div className="p-1.5 bg-[#f6f6f6] rounded-full inline-flex w-full md:w-auto h-auto overflow-x-auto shadow-inner hide-scrollbar">
              {[
                { id: "semua", label: "Semua Rasa", activeColor: "bg-primary" },
                { id: "pedas", label: "🔥 Pedas", activeColor: "bg-[#C62828]" },
                { id: "gurih", label: "🧀 Gurih", activeColor: "bg-[#F57F17]" },
                { id: "manis", label: "🍯 Manis", activeColor: "bg-[#4CAF50]" },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={`/products?tab=${tab.id}&page=1`}
                  className={`rounded-full px-6 py-3 font-bold text-sm md:text-base transition-all w-full md:w-auto flex-shrink-0 text-center ${
                    activeTab === tab.id
                      ? `${tab.activeColor} text-white shadow-md`
                      : "text-dark/60 hover:text-dark"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-[#f6f6f6] inline-flex items-center justify-center w-20 h-20 rounded-full mb-4">
                  <span className="material-symbols-outlined text-4xl text-dark/20">inventory_2</span>
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-on-background/60">Belum ada produk untuk kategori ini.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <ProductPagination 
              currentPage={meta.page} 
              totalPages={meta.totalPages} 
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
