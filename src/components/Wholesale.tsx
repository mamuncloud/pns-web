import { Button } from "./ui/button";

export default function Wholesale() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="bg-linear-to-br from-[#FEF2F2] to-white dark:from-zinc-900/50 dark:to-zinc-950 border border-red-100 dark:border-zinc-800 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h3 className="font-headline text-4xl font-extrabold text-[#C62828] dark:text-primary mb-4">
            Grosir lebih Hemat
          </h3>
          <p className="text-on-background/70 dark:text-zinc-400 text-lg font-semibold leading-relaxed">
            Stok lebih banyak, harga lebih hemat untuk pesta atau jualan
            kembali.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <Button className="w-full md:w-auto bg-accent text-primary-foreground font-headline font-black text-lg h-14 px-10 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20">
            Pesan Grosir
          </Button>
        </div>
        {/* Background element */}
        <div className="absolute right-[-5%] top-[-20%] opacity-[0.03] dark:opacity-[0.05]">
          <span
            className="material-symbols-outlined text-[15rem] rotate-12 text-[#C62828] dark:text-primary"
            data-icon="inventory_2"
          >
            inventory_2
          </span>
        </div>
      </div>
    </section>
  );
}
