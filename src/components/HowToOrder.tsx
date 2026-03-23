export default function HowToOrder() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="bg-[#FDF2F2] rounded-[3rem] p-16 text-center">
        <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">
          Cara Pesan Mudah
        </h2>
        <p className="text-on-background/60 font-medium mb-16 max-w-lg mx-auto">
          Nikmati kemudahan berbelanja camilan favorit kamu hanya dalam 3
          langkah sederhana.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-4xl">
                shopping_basket
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-dark mb-3">
              1. Pilih Camilan
            </h3>
            <p className="text-on-background/60 text-sm max-w-[250px]">
              Jelajahi beragam pilihan snack lezat dan masukkan ke keranjang
              belanja kamu.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-4xl">
                qr_code_2
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-dark mb-3">
              2. Bayar QRIS
            </h3>
            <p className="text-on-background/60 text-sm max-w-[250px]">
              Lakukan pembayaran instan menggunakan QRIS dari aplikasi bank atau
              e-wallet apa pun.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-4xl">store</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-dark mb-3">
              3. Ambil di Toko
            </h3>
            <p className="text-on-background/60 text-sm max-w-[250px]">
              Tunjukkan bukti bayar dan ambil pesanan kamu langsung di outlet PNS
              terdekat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
