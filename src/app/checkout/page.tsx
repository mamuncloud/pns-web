"use client";

import { useState, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ArrowLeft, QrCode, Minus, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { CreateOrderDto } from "@/types/financial";
import Link from "next/link";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isStoreOpen } = useStoreSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [customerFound, setCustomerFound] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");



  // Auto-fill name from DB when user leaves the phone field
  const handlePhoneBlur = useCallback(async () => {
    const phone = customerPhone.trim();
    if (!phone || phone.length < 9) return;

    setIsLookingUp(true);
    setCustomerFound(false);
    try {
      const result = await api.orders.lookupCustomer(phone);
      if (result.success && result.data?.name) {
        setCustomerName(result.data.name);
        setCustomerFound(true);
      }
    } catch {
      // Silently fail — user can still fill in name manually
    } finally {
      setIsLookingUp(false);
    }
  }, [customerPhone]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerPhone) {
      toast.error("Nomor WhatsApp wajib diisi");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: CreateOrderDto = {
        orderType: "PRE_ORDER",
        paymentMethod: "MAYAR",
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim(),
        items: items.map((item) => ({
          productVariantId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await api.orders.create(orderData);

      if (response.success) {
        if (response.data?.paymentUrl) {
          clearCart();
          toast.success("Pesanan berhasil dibuat! Mengarahkan ke pembayaran...");
          window.location.href = response.data.paymentUrl;
        } else {
          clearCart();
          toast.success("Pesanan berhasil dibuat!");
          router.push("/checkout/success");
        }
      } else {
        toast.error(response.message || "Gagal memproses pesanan.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <QrCode className="h-10 w-10 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-black text-dark dark:text-white mb-2">Keranjang Kosong</h1>
        <p className="text-on-background/60 dark:text-zinc-400 mb-8 max-w-sm">
          Kamu belum menambahkan camilan apapun ke keranjang. Yuk cari camilan favoritmu!
        </p>
        <Link href="/products">
          <Button className="h-14 px-8 rounded-2xl font-bold">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-background/60 dark:text-zinc-400 hover:text-primary transition-colors py-4 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-bold">Kembali</span>
        </button>

        <h1 className="font-headline font-black text-3xl sm:text-4xl text-dark dark:text-white mb-8">
          Checkout Pesanan
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">Daftar Belanja</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="h-20 w-20 shrink-0 bg-white dark:bg-zinc-800 rounded-xl overflow-hidden relative border border-zinc-100 dark:border-zinc-700">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-dark dark:text-white line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-on-background/60 dark:text-zinc-400 mt-1">
                            {item.package} {item.sizeInGram ? `(${item.sizeInGram}g)` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-black text-primary">{formatCurrency(item.price)}</span>
                        <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1">
                          <button
                            className="p-1 hover:text-primary disabled:opacity-50"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            className="p-1 hover:text-primary disabled:opacity-50"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-white dark:bg-zinc-900/50 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Detail Pengambilan</h2>

              {!isStoreOpen && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold mb-1">Toko Sedang Tutup</p>
                    <p className="opacity-90">Maaf, kami tidak menerima pesanan saat ini. Silakan coba lagi nanti.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-6">
                <div className="space-y-4">
                  {/* Phone first — required */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Nomor WhatsApp <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setCustomerFound(false);
                      }}
                      onBlur={handlePhoneBlur}
                      required
                    />
                    {isLookingUp && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Mencari data pelanggan...
                      </p>
                    )}
                    {customerFound && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Pelanggan ditemukan, nama telah diisi otomatis.
                      </p>
                    )}
                    {!isLookingUp && !customerFound && (
                      <p className="text-xs text-on-background/60 dark:text-zinc-500">
                        Untuk konfirmasi pesanan jika ada kendala.
                      </p>
                    )}
                  </div>

                  {/* Name — optional, auto-filled */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nama Lengkap{" "}
                      <span className="text-xs text-zinc-400 font-normal">(opsional)</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Budi Santoso"
                      className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-background/60 dark:text-zinc-400">Total Produk</span>
                    <span className="font-bold">{items.reduce((s, i) => s + i.quantity, 0)} item</span>
                  </div>
                  <div className="flex justify-between items-center text-lg mt-2">
                    <span className="font-bold">Total Pembayaran</span>
                    <span className="font-black text-2xl text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !isStoreOpen}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:bg-zinc-400 dark:disabled:bg-zinc-800 disabled:shadow-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5" />
                      Bayar via QRIS
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-on-background/60 dark:text-zinc-500 font-medium">
                  Pembayaran aman dan praktis menggunakan QRIS. Anda dapat mengambil pesanan di kasir
                  setelah pembayaran terkonfirmasi.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
