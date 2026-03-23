import ProductCard from "./ProductCard";
import { dummyProducts } from "@/lib/data/products";

export default function Bestsellers() {
  // Use the first 3 products as bestsellers for demonstration
  const bestsellerProducts = dummyProducts.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <h2 className="font-headline text-4xl font-extrabold text-primary mb-12 text-center">
        Produk Terlaris Minggu Ini
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {bestsellerProducts.map((product) => (
          <ProductCard key={product.id} product={product} isBestseller={true} />
        ))}
      </div>
    </section>
  );
}
