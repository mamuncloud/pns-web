"use client";

import { Button } from "./ui/button";
import { PackageOpen, ArrowRight, Sparkles } from "lucide-react";

export default function Wholesale() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="relative group overflow-hidden rounded-[3rem] p-10 md:p-16 border border-white/20 dark:border-white/10 bg-linear-to-br from-white/40 to-primary/5 dark:from-white/5 dark:to-primary/10 backdrop-blur-2xl shadow-2xl shadow-primary/10">
        
        {/* Decorative Mesh Gradients */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest italic border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Hemat Maksimal
            </div>
            
            <h3 className="font-headline text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-primary leading-tight">
              Grosir <br className="hidden md:block" />
              lebih Hemat
            </h3>
            
            <p className="text-on-background/70 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
              Stok lebih banyak, harga lebih hemat untuk pesta atau jualan
              kembali. Nikmati penawaran eksklusif kami.
            </p>
            
            <div className="pt-4">
              <Button className="group/btn relative h-16 px-10 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-sm italic transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.05] active:scale-[0.98] border border-white/10 text-primary-foreground">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center gap-3">
                  Pesan Grosir Sekarang
                  <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover/btn:translate-x-1" />
                </div>
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Animated Icon Container */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              <div className="relative bg-linear-to-br from-white/10 to-primary/5 dark:from-white/5 dark:to-primary/10 backdrop-blur-xl border border-white/20 dark:border-white/10 p-12 rounded-[2.5rem] shadow-2xl animate-float group-hover:rotate-3 transition-transform duration-700">
                <PackageOpen className="w-24 h-24 md:w-32 md:h-32 text-primary" strokeWidth={1} />
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-accent text-primary-foreground font-black italic px-4 py-2 rounded-xl text-sm shadow-xl animate-float-delayed rotate-12">
                DISKON %
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground font-black italic px-4 py-2 rounded-xl text-sm shadow-xl animate-float rotate-[-12deg]">
                RESELLER
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite 1s;
        }
      `}</style>
    </section>
  );
}
