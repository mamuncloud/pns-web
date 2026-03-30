import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const snackItems = [
  {
    id: 1,
    name: "Basreng Pedas",
    image: "/hero/basreng.webp",
    className: "lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto", // Large Square
    tag: "Terlaris",
  },
  {
    id: 2,
    name: "Makaroni Spiral",
    image: "/hero/makaroni.jpg",
    className: "aspect-square", // Small Square
    tag: "Gurih",
  },
  {
    id: 3,
    name: "Seblak Kering",
    image: "/hero/seblak.jpg",
    className: "aspect-square", // Small Square
    tag: "Mix",
  },
  {
    id: 4,
    name: "Keripik Pisang",
    image: "/hero/pisang.jpg",
    className: "aspect-square", // Small Square
    tag: "Manis",
  },
  {
    id: 5,
    name: "Usus Balado",
    image: "/hero/usus.jpg",
    className: "col-span-2 aspect-[2/1] lg:aspect-auto", // Wide Rect
    tag: "Kriuk",
  },
];

export default function Hero() {
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

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group h-14 md:h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all duration-300 hover:scale-[1.05] hover:shadow-lg">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Pesan Sekarang
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
                
                <Button variant="ghost" className="h-14 md:h-16 px-8 rounded-2xl border-2 border-primary/20 hover:border-primary/50 text-primary dark:text-white font-bold transition-all">
                  Lihat Etalase
                </Button>
              </div>
            </div>
          </div>

          {/* Bento Grid Variety */}
          <div className="lg:col-span-12 xl:col-span-7 order-2 lg:order-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {snackItems.map((item, index) => (
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
