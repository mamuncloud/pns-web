"use client";

import { useActionState } from "react";
import { submitPartnerForm, FormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Store, TrendingUp, Handshake } from "lucide-react";

export default function PartnerPage() {
  const [state, formAction, pending] = useActionState(submitPartnerForm, {
    success: false,
  } as FormState);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-0 rounded-full py-1 px-4 mb-2">
            Peluang Kemitraan
          </Badge>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-dark tracking-tight">
            Tumbuh Bersama Planet Nyemil Snack
          </h1>
          <p className="text-on-background/70 text-lg">
            Bergabunglah menjadi mitra kami dan nikmati berbagai keuntungan eksklusif. Tersedia program Reseller, Dropshipper, dan Grosir.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Margin Menarik</h3>
            <p className="text-on-background/70">
              Dapatkan harga khusus mitra dengan potensi margin keuntungan yang sangat menjanjikan untuk bisnis Anda.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#4CAF50]/10 flex items-center justify-center text-[#4CAF50] mb-6">
              <Store size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Produk Laris</h3>
            <p className="text-on-background/70">
              Produk unggulan kami selalu diminati. Stok aman dan kualitas terjamin untuk menjaga kepuasan pelanggan Anda.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F57F17]/10 flex items-center justify-center text-[#F57F17] mb-6">
              <Handshake size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Dukungan Penuh</h3>
            <p className="text-on-background/70">
              Kami sediakan materi promosi, dukungan pelanggan, dan bimbingan pemasaran untuk membantu penjualan Anda.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          <h2 className="text-2xl font-bold mb-6">Mulai Kemitraan Anda</h2>
          
          {state?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Pendaftaran Berhasil!</h3>
              <p className="text-green-800">{state.message}</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Daftar Lagi
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              {state?.message && !state?.success && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {state.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-dark">Nama Lengkap</label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Masukkan nama Anda" 
                    className={cn("rounded-xl", state?.errors?.name && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {state?.errors?.name && <p className="text-xs text-red-500 font-medium">{state.errors.name[0]}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-dark">Nomor WhatsApp</label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel"
                    placeholder="Contoh: 081234567890" 
                    className={cn("rounded-xl", state?.errors?.phone && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {state?.errors?.phone && <p className="text-xs text-red-500 font-medium">{state.errors.phone[0]}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-dark">Email</label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="Masukkan alamat email aktif" 
                  className={cn("rounded-xl", state?.errors?.email && "border-red-500 focus-visible:ring-red-500")}
                />
                {state?.errors?.email && <p className="text-xs text-red-500 font-medium">{state.errors.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="partnershipType" className="text-sm font-bold text-dark">Jenis Kemitraan</label>
                <div className="relative">
                  <select 
                    id="partnershipType" 
                    name="partnershipType" 
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                      state?.errors?.partnershipType && "border-red-500 focus-visible:ring-red-500"
                    )}
                    defaultValue=""
                  >
                    <option value="" disabled>Pilih Jenis Kemitraan</option>
                    <option value="reseller">Reseller</option>
                    <option value="dropshipper">Dropshipper</option>
                    <option value="wholesale">Grosir / Wholesale</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <span className="material-symbols-outlined text-gray-400 text-xl">expand_more</span>
                  </div>
                </div>
                {state?.errors?.partnershipType && <p className="text-xs text-red-500 font-medium">{state.errors.partnershipType[0]}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-dark">Pesan Tambahan (Opsional)</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4}
                  placeholder="Ceritakan sedikit tentang toko atau rencana penjualan Anda..." 
                  className={cn(
                    "flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                    state?.errors?.message && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {state?.errors?.message && <p className="text-xs text-red-500 font-medium">{state.errors.message[0]}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-xl h-12 text-md font-bold"
                disabled={pending}
              >
                {pending ? "Mengirim..." : "Kirim Pengajuan"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
