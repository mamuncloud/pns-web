import Image from "next/image";

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
          <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-full font-headline font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all">
            Pesan Sekarang
          </button>
          <button className="bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-10 py-4 rounded-full font-headline font-black text-lg active:scale-95 transition-all">
            Lihat Produk
          </button>
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
