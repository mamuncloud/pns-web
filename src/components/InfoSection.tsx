import Link from "next/link";

export default function InfoSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 bg-primary rounded-[2.5rem] p-12 text-white flex flex-col justify-between">
          <div>
            <h2 className="font-headline text-4xl font-bold mb-4">
              Planet Nyemil Snack
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Dapatkan info promo spesial dan update varian snack terbaru langsung
              di WhatsApp kamu.
            </p>
          </div>
          <div className="flex gap-3 bg-white/20 p-1 rounded-full">
            <input
              className="bg-transparent border-none focus:ring-0 px-6 py-3 flex-1 text-white placeholder:text-white/60 outline-none"
              placeholder="No. WhatsApp"
              type="text"
            />
            <button className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
              Daftar
            </button>
          </div>
        </div>
        <div className="md:col-span-3 bg-white border border-gray-100 rounded-[2.5rem] p-10 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-dark/40 mb-3">
            Jam Operasional
          </span>
          <p className="text-3xl font-headline font-extrabold text-primary mb-2">
            09:00 — 22:00
          </p>
          <p className="text-on-background/60 font-medium">
            Buka Setiap Hari <br /> Termasuk Libur Nasional
          </p>
        </div>
        <div className="md:col-span-3 bg-[#FEF9EC] rounded-[2.5rem] p-10 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-dark/40 mb-3">
            Lokasi Kami
          </span>
          <p className="text-on-background/70 font-bold mb-6">
            Jl. Beringin Raya No.6B, RT.006/RW.002, Karawaci Baru, Kec. Karawaci,
            Tangerang Kota, Banten 15116
          </p>
          <Link
            className="text-primary font-bold flex items-center gap-2 hover:underline"
            target="_blank"
            href="https://maps.app.goo.gl/nGVMBhaeE1fZVbfB7"
          >
            Buka Maps{" "}
            <span className="material-symbols-outlined text-sm">
              open_in_new
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
