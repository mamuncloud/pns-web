export default function HowToOrder() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="bg-[#FDF2F2] dark:bg-zinc-900/50 dark:border dark:border-zinc-800/50 rounded-[3rem] p-16 text-center">
        <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">
          Cara Pesan Mudah
        </h2>
        <p className="text-on-background/60 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Nikmati kemudahan berbelanja camilan favorit kamu hanya dalam 3 langkah
          sederhana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center space-y-6 group">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">
              shopping_basket
            </span>
          </div>
          <div className="space-y-3">
            <h3 className="font-headline font-black text-xl tracking-tight text-on-background dark:text-zinc-100">
              1. Pilih Camilan
            </h3>
            <p className="text-on-background/60 dark:text-zinc-400 leading-relaxed text-sm md:text-base px-2">
              Jelajahi beragam pilihan snack lezat dan masukkan ke keranjang belanja kamu.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center space-y-6 group">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">qr_code_2</span>
          </div>
          <div className="space-y-3">
            <h3 className="font-headline font-black text-xl tracking-tight text-on-background dark:text-zinc-100">
              2. Bayar QRIS
            </h3>
            <p className="text-on-background/60 dark:text-zinc-400 leading-relaxed text-sm md:text-base px-2">
              Lakukan pembayaran instan menggunakan QRIS dari aplikasi bank atau e-wallet apa pun.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center space-y-6 group">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">storefront</span>
          </div>
          <div className="space-y-3">
            <h3 className="font-headline font-black text-xl tracking-tight text-on-background dark:text-zinc-100">
              3. Ambil di Toko
            </h3>
            <p className="text-on-background/60 dark:text-zinc-400 leading-relaxed text-sm md:text-base px-2">
              Tunjukkan bukti bayar dan ambil pesanan kamu langsung di outlet PNS terdekat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
