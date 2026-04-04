import { ShoppingBasket, QrCode, Store } from "lucide-react";

export default function HowToOrder() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32 relative group/section">
      {/* Decorative background glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-[var(--pns-primary)]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="relative overflow-hidden bg-gradient-to-b from-[var(--pns-primary)]/5 via-background to-background dark:from-[#FFD700]/8 dark:via-[#1a1614] dark:to-[#141110] rounded-[4rem] border border-[var(--pns-primary)]/10 dark:border-[#FFD700]/10 p-12 md:p-20 shadow-2xl transition-all duration-700 hover:shadow-[var(--pns-primary)]/5">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24 relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[var(--pns-primary)]/10 dark:bg-[#FFD700]/15 text-[var(--pns-primary)] text-xs font-bold uppercase tracking-widest">
            Proses Mudah
          </div>
          <h2 className="font-headline text-4xl md:text-5xl font-black text-on-background dark:text-white mb-6 tracking-tight leading-tight">
            Cara Pesan <span className="text-[var(--pns-primary)] italic">Mudah</span>
          </h2>
          <p className="text-on-background/70 dark:text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Nikmati kemudahan berbelanja camilan favorit kamu hanya dalam 3 langkah sederhana yang praktis & cepat.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[2.4rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[var(--pns-primary)]/30 to-transparent -z-0">
            <div className="absolute inset-0 bg-[var(--pns-primary)]/20 blur-[2px]" />
          </div>

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center space-y-8 group/step z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[var(--pns-primary)] dark:bg-[#FFD700] text-white dark:text-[#1a1200] flex items-center justify-center shadow-2xl shadow-[var(--pns-primary)]/20 group-hover/step:rotate-12 transition-all duration-500 group-hover/step:scale-110">
                <ShoppingBasket className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent dark:bg-[#FFB300] text-dark dark:text-[#1a1200] font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-[#1a1614]">
                1
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-background dark:text-white">
                Pilih Camilan
              </h3>
              <p className="text-on-background/70 dark:text-zinc-300 leading-relaxed text-base md:text-lg px-4 group-hover/step:text-on-background/90 dark:group-hover/step:text-zinc-200 transition-colors">
                Jelajahi beragam pilihan snack lezat dan masukkan ke keranjang belanja kamu.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center space-y-8 group/step z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[var(--pns-primary)] dark:bg-[#FFD700] text-white dark:text-[#1a1200] flex items-center justify-center shadow-2xl shadow-[var(--pns-primary)]/20 group-hover/step:-rotate-12 transition-all duration-500 group-hover/step:scale-110">
                <QrCode className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent dark:bg-[#FFB300] text-dark dark:text-[#1a1200] font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-[#1a1614]">
                2
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-background dark:text-white">
                Bayar QRIS
              </h3>
              <p className="text-on-background/70 dark:text-zinc-300 leading-relaxed text-base md:text-lg px-4 group-hover/step:text-on-background/90 dark:group-hover/step:text-zinc-200 transition-colors">
                Lakukan pembayaran instan menggunakan QRIS dari aplikasi bank atau e-wallet apa pun.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center space-y-8 group/step z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[var(--pns-primary)] dark:bg-[#FFD700] text-white dark:text-[#1a1200] flex items-center justify-center shadow-2xl shadow-[var(--pns-primary)]/20 group-hover/step:rotate-12 transition-all duration-500 group-hover/step:scale-110">
                <Store className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent dark:bg-[#FFB300] text-dark dark:text-[#1a1200] font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-[#1a1614]">
                3
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-black text-2xl tracking-tight text-on-background dark:text-white">
                Ambil di Toko
              </h3>
              <p className="text-on-background/70 dark:text-zinc-300 leading-relaxed text-base md:text-lg px-4 group-hover/step:text-on-background/90 dark:group-hover/step:text-zinc-200 transition-colors">
                Tunjukkan bukti bayar dan ambil pesanan kamu langsung di outlet PNS terdekat.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Abstract Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--pns-primary)]/20 to-transparent" />
      </div>
    </section>
  );
}
