"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, QrCode } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
      <div className="relative mb-8 text-primary">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        <CheckCircle2 className="h-24 w-24 relative z-10" />
      </div>
      
      <h1 className="text-3xl font-black text-dark dark:text-white mb-4">
        Pesanan Berhasil Dibuat!
      </h1>
      
      <p className="text-on-background/60 dark:text-zinc-400 mb-8 max-w-md mx-auto">
        Silakan menuju ke kasir dan tunjukkan halaman ini untuk melakukan pembayaran via QRIS dan mengambil pesananmu.
      </p>

      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8 max-w-sm w-full shadow-xl shadow-zinc-200/50 dark:shadow-none">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
            <QrCode className="h-8 w-8" />
          </div>
          <p className="text-sm font-bold text-dark dark:text-white uppercase tracking-widest">
            Bayar & Ambil di Kasir
          </p>
          <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
          <p className="text-xs text-on-background/60 dark:text-zinc-400 text-center">
            Pesanan telah tercatat di sistem toko.
          </p>
        </div>
      </div>

      <Link href="/products">
        <Button className="h-14 px-8 rounded-2xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          Kembali Berbelanja
        </Button>
      </Link>
    </div>
  );
}
