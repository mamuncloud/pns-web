import { ShoppingBasket, QrCode, Store } from "lucide-react";

export default function HowToOrder() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32 relative group/section">
      {/* Decorative background glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background dark:from-primary/10 dark:via-zinc-900/50 dark:to-zinc-900/10 rounded-[4rem] border border-primary/10 dark:border-white/5 p-12 md:p-20 shadow-2xl transition-all duration-700 hover:shadow-primary/5">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24 relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary dark:text-primary-foreground text-xs font-bold uppercase tracking-widest animate-pulse-slow">
            Proses Mudah
          </div>
          <h2 className="font-headline text-4xl md:text-5xl font-black text-on-background dark:text-zinc-100 mb-6 tracking-tight leading-tight">
            Cara Pesan <span className="text-primary italic">Mudah</span>
          </h2>
          <p className="text-on-background/60 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Nikmati kemudahan berbelanja camilan favorit kamu hanya dalam 3 langkah sederhana yang praktis & cepat.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[2.4rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-0">
            <div className="absolute inset-0 bg-primary/20 blur-[2px]" />
          </div>

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center space-y-8 group/step z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/20 group-hover/step:rotate-12 transition-all duration-500 group-hover/step:scale-110">
                <ShoppingBasket className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-dark font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-zinc-900">
                1
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-background dark:text-zinc-100">
                Pilih Camilan
              </h3>
              <p className="text-on-background/60 dark:text-zinc-400 leading-relaxed text-base md:text-lg px-4 opacity-80 group-hover/step:opacity-100 transition-opacity">
                Jelajahi beragam pilihan snack lezat dan masukkan ke keranjang belanja kamu.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center space-y-8 group/step z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/20 group-hover/step:-rotate-12 transition-all duration-500 group-hover/step:scale-110">
                <QrCode className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-dark font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-zinc-900">
                2
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-background dark:text-zinc-100">
                Bayar QRIS
              </h3>
              <p className="text-on-background/60 dark:text-zinc-400 leading-relaxed text-base md:text-lg px-4 opacity-80 group-hover/step:opacity-100 transition-opacity">
                Lakukan pembayaran instan menggunakan QRIS dari aplikasi bank atau e-wallet apa pun.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center space-y-8 group/step z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/20 group-hover/step:rotate-12 transition-all duration-500 group-hover/step:scale-110">
                <Store className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-dark font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-zinc-900">
                3
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-background dark:text-zinc-100">
                Ambil di Toko
              </h3>
              <p className="text-on-background/60 dark:text-zinc-400 leading-relaxed text-base md:text-lg px-4 opacity-80 group-hover/step:opacity-100 transition-opacity">
                Tunjukkan bukti bayar dan ambil pesanan kamu langsung di outlet PNS terdekat.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Abstract Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </section>
  );
}
