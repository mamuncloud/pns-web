"use client";

import { useActionState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitPartnerForm, FormState } from "@/app/partner/actions";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const initialState: FormState = {
  message: "",
  success: false,
};

export default function PartnerPageContent() {
  const [state, formAction, isPending] = useActionState(
    submitPartnerForm,
    initialState,
  );

  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20 md:pb-24 min-h-screen bg-[#fafafa] dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Info Section */}
          <div className="flex flex-col justify-center">
            <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl text-dark dark:text-white leading-[1.1] tracking-tighter mb-6">
              Mulai Bisnis Snack Anda Bersama Kami
            </h1>
            <p className="text-lg md:text-xl text-on-background/60 dark:text-zinc-400 mb-8 max-w-xl">
              Bergabunglah dengan ekosistem Planet Nyemil Snack sebagai reseller
              atau mitra grosir. Kami menyediakan produk berkualitas dengan
              margin yang menguntungkan.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: "Produk Terlaris",
                  desc: "Akses ke ratusan varian snack yang sudah terbukti laris di pasaran.",
                  icon: "trending_up",
                },
                {
                  title: "Harga Grosir",
                  desc: "Dapatkan harga khusus untuk pembelian partai besar atau reseller.",
                  icon: "payments",
                },
                {
                  title: "Dukungan Penuh",
                  desc: "Bantuan marketing dan materi promosi untuk membantu Anda berjualan.",
                  icon: "support_agent",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark dark:text-white text-lg">
                      {item.title}
                    </h3>
                    <p className="text-on-background/60 dark:text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none h-fit">
            <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
              Daftar Sekarang
            </h2>
            <p className="text-on-background/60 dark:text-zinc-400 mb-8">
              Isi formulir di bawah ini dan tim kami akan segera menghubungi
              Anda.
            </p>

            {state.success ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-2">
                  Pendaftaran Berhasil!
                </h3>
                <p className="text-green-700 dark:text-green-500/80">
                  {state.message}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-xl"
                  variant="outline"
                >
                  Kirim Pendaftaran Lain
                </Button>
              </div>
            ) : (
              <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold ml-1">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Masukkan nama lengkap"
                    className="rounded-xl h-12"
                    required
                  />
                  {state.errors?.name && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {state.errors.name[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold ml-1">
                      Alamat Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@contoh.com"
                      className="rounded-xl h-12"
                      required
                    />
                    {state.errors?.email && (
                      <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />{" "}
                        {state.errors.email[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold ml-1">
                      Nomor WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="0812XXXXXXXX"
                      className="rounded-xl h-12"
                      required
                    />
                    {state.errors?.phone && (
                      <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />{" "}
                        {state.errors.phone[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnershipType" className="font-bold ml-1">
                    Jenis Kemitraan
                  </Label>
                  <Select name="partnershipType" required>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Pilih jenis kemitraan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reseller">Reseller</SelectItem>
                      <SelectItem value="dropshipper">Dropshipper</SelectItem>
                      <SelectItem value="wholesale">Grosir / Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                  {state.errors?.partnershipType && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {state.errors.partnershipType[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-bold ml-1">
                    Pesan (Opsional)
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Ceritakan sedikit tentang rencana bisnis Anda..."
                    className="rounded-xl min-h-[100px] resize-none"
                  />
                </div>

                {!state.success && state.message && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {state.message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 mt-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Kirim Pendaftaran"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
