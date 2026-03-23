export default function Wholesale() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="bg-[#4E342E] rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h3 className="font-headline text-4xl font-extrabold text-white mb-4">
            Varian Bal
          </h3>
          <p className="text-white/70 text-lg font-medium">
            Stok lebih banyak, harga lebih hemat untuk pesta atau jualan
            kembali.
          </p>
        </div>
        <button className="relative z-10 bg-accent text-dark px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
          Pesan Grosir
        </button>
        {/* Background element */}
        <div className="absolute right-[-5%] top-[-20%] opacity-10">
          <span
            className="material-symbols-outlined text-[15rem] rotate-12 text-white"
            data-icon="inventory_2"
          >
            inventory_2
          </span>
        </div>
      </div>
    </section>
  );
}
