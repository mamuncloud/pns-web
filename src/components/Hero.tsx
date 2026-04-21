import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductsFromDb } from "@/lib/products-db";

const bentoClassNames = [
  "lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto", // Large Square
  "aspect-square", // Small Square
  "aspect-square", // Small Square
  "aspect-square", // Small Square
  "col-span-2 aspect-[2/1] lg:aspect-auto", // Wide Rect
];

export default async function Hero() {
  // Fetch more products to increase chances of finding enough with images
  const { data: allProducts } = await getProductsFromDb(1, 50);
  
  // Filter products that have an image
  const productsWithImage = allProducts.filter(p => p.imageUrl && p.imageUrl.trim() !== "");
  
  // For now, just use the products as they are to avoid purity issues with Math.random()
  const shuffled = productsWithImage;
  
  // Map them into snackItems format
  const dynamicItems = shuffled.slice(0, 5).map((product, index) => ({
    id: product.id,
    name: product.name,
    image: product.imageUrl,
    className: bentoClassNames[index],
    tag: product.taste && product.taste.length > 0 ? product.taste[0] : "Spesial",
  }));

  const fallbackItems = [
    { id: "f1", name: "Basreng Pedas", image: "/hero/basreng.webp", className: bentoClassNames[0], tag: "Terlaris" },
    { id: "f2", name: "Makaroni Spiral", image: "/hero/makaroni.jpg", className: bentoClassNames[1], tag: "Gurih" },
    { id: "f3", name: "Seblak Kering", image: "/hero/seblak.jpg", className: bentoClassNames[2], tag: "Mix" },
    { id: "f4", name: "Keripik Pisang", image: "/hero/pisang.jpg", className: bentoClassNames[3], tag: "Manis" },
    { id: "f5", name: "Usus Balado", image: "/hero/usus.jpg", className: bentoClassNames[4], tag: "Kriuk" },
  ];

  // Fill remaining slots with fallbacks if needed
  const finalItems = Array.from({ length: 5 }).map((_, i) => {
    if (i < dynamicItems.length) {
      return dynamicItems[i];
    }
    return {
      ...fallbackItems[i],
      className: bentoClassNames[i], // Ensure class is correct
    };
  });

  return (
    <section className="relative w-full min-h-screen flex items-center pt-16 pb-24 lg:pt-20 lg:pb-32 overflow-x-clip">
      {/* Background Mesh Decor */}
      <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-12 xl:col-span-5 order-1 lg:order-1 flex flex-col justify-center animate-stagger" style={{ animationDelay: '0s' }}>
            <div className="glass-card p-6 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              
              <div className="flex items-center gap-2 mb-6 text-primary font-black uppercase tracking-[0.2em] text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Planet Nyemil Snack</span>
              </div>

              <h1 className="font-headline text-5xl md:text-7xl font-black text-on-background dark:text-white leading-[1.1] tracking-tighter mb-6">
                SATU PLANET,<br />
                <span className="animate-shimmer inline-block pb-2 px-1">RIBUAN RASA!</span>
              </h1>

              <p className="text-on-background/80 dark:text-zinc-300 text-lg md:text-xl font-medium max-w-sm leading-relaxed mb-10">
                Puas-puasin lidah kamu dengan camilan autentik paling nagih se-jagad raya.
              </p>

              <div className="flex w-full mt-6">
                <Link href="/products" className="w-full relative group">
                  <Button className="relative w-full h-16 md:h-20 rounded-2xl bg-primary hover:bg-primary/95 text-white text-lg md:text-xl font-black overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
                    
                    {/* Hover swoosh shine effect */}
                    <div className="absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />
                    
                    <div className="relative flex items-center justify-center gap-3 w-full">
                      <ShoppingBag className="h-6 w-6 md:h-7 md:w-7 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
                      <span className="tracking-wide uppercase">
                        Jelajahi Ribuan Rasa
                      </span>
                      <ArrowRight className="h-6 w-6 md:h-7 md:w-7 transition-transform duration-500 group-hover:translate-x-2" />
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bento Grid Variety */}
          <div className="lg:col-span-12 xl:col-span-7 order-2 lg:order-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {finalItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative group overflow-hidden rounded-[2rem] animate-stagger border border-white/10 shadow-lg",
                    item.className
                  )}
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="relative w-full h-full min-h-[150px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={index === 0}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
                    <span className="inline-block px-3 py-1 rounded-lg bg-primary/95 text-primary-foreground text-[10px] font-black uppercase tracking-wider mb-2 shadow-sm">
                      {item.tag}
                    </span>
                    <h3 className="text-white font-bold text-sm md:text-lg leading-tight drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>

                  <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors pointer-events-none rounded-[2rem]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
