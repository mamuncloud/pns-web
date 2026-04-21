import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  
  // Fetch paginated products from DB - request only items that have stock
  const { data: products, meta } = await getProductsFromDb(page, 12, tasteFilter, undefined, true);

  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-32 pb-32 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline text-4xl font-extrabold text-dark dark:text-white tracking-tight mb-2">
              Katalog Produk
            </h2>
            <p className="text-on-background/60 dark:text-zinc-400 font-medium text-lg">
              Eksplorasi berbagai rasa snack favoritmu
            </p>
          </div>

          {/* Categories Tabs as Links for Search SEO and Pagination logic */}
          <div className="w-full mb-10">
            <div className="p-1.5 bg-[#f6f6f6] dark:bg-zinc-900 rounded-full inline-flex w-full md:w-auto h-auto overflow-x-auto shadow-inner hide-scrollbar border dark:border-white/5">
              {[
                { id: "semua", label: "Semua Rasa", lightActive: "bg-primary", darkActive: "dark:bg-primary" },
                { id: "pedas", label: "🔥 Pedas", lightActive: "bg-[#C62828]", darkActive: "dark:bg-primary" },
                { id: "gurih", label: "🧀 Gurih", lightActive: "bg-[#F57F17]", darkActive: "dark:bg-primary" },
                { id: "manis", label: "🍯 Manis", lightActive: "bg-[#4CAF50]", darkActive: "dark:bg-primary" },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={`/products?tab=${tab.id}&page=1`}
                  className={`rounded-full px-6 py-3 font-bold text-sm md:text-base transition-all w-full md:w-auto flex-shrink-0 text-center ${
                    activeTab === tab.id
                      ? `${tab.lightActive} ${tab.darkActive} text-white dark:text-zinc-950 shadow-md`
                      : "text-dark/60 dark:text-zinc-500 hover:text-dark dark:hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-[#f6f6f6] dark:bg-zinc-900 inline-flex items-center justify-center w-20 h-20 rounded-full mb-4">
                  <span className="material-symbols-outlined text-4xl text-dark/20 dark:text-white/10">inventory_2</span>
                </div>
                <h3 className="text-xl font-bold text-dark dark:text-white mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-on-background/60 dark:text-zinc-400">Belum ada produk untuk kategori ini.</p>
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
