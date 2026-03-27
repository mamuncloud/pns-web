import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="w-full md:w-1/2 space-y-8">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary leading-[1.1] tracking-tight">
            Nikmati Camilan <br />
            Favorit Kamu <br />
            Kapan Saja!
          </h1>
          <p className="text-on-background/70 dark:text-zinc-400 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
            Kelezatan autentik dengan bumbu melimpah. Dari Basreng hingga Keripik Singkong, semua ada di Planet Nyemil Snack.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-10">
            <Button className="group relative h-16 px-10 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-sm italic transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.05] active:scale-[0.98] border border-white/10 text-primary-foreground min-w-[200px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative flex items-center justify-center gap-3">
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary-foreground rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </div>
                <span className="relative">
                  Pesan Sekarang
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-foreground/30 transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
            </Button>

            <Button variant="outline" className="group relative h-16 px-10 overflow-hidden rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-md font-black uppercase tracking-widest text-sm italic transition-all duration-500 hover:bg-white/10 hover:scale-[1.05] active:scale-[0.98] border border-white/20 text-white min-w-[200px]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative flex items-center justify-center gap-3">
                <span className="relative">
                  Lihat Produk
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/30 transition-all duration-500 group-hover:w-full" />
                </span>
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
              </div>
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="relative rounded-[3rem] overflow-hidden aspect-square">
            <Image
              alt="Hero snack image"
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7kF66mTD-AEC-pQweXs4lTGOMZ5AYN6Qasl2kBCcpHSxupGtiYsILuYvxDgvd8YkzkWlMGt8pMLrYK4UAk4A0BgIwSipNvHognZ8ytxVELOE67mVU1loPXniQ97KQRf8Bzz4LyTO4NpXwCOOQIgWneVqo_Hjp9EiuY-QN-HGydWDvsII41VqYyWONPt1GFDwjammyH_y65Txr0VOGadobCIOyxTJFGCeRqDQctgeEbcAY16jSmyAy_5OFJhrauSW3LTDT0ZdUPbI"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
