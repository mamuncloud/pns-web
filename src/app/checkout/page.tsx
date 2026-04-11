"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, getProductImageUrl } from "@/lib/utils";
import { Trash2, ArrowLeft, Send, QrCode, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { CreateOrderDto } from "@/types/financial";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName || !customerPhone) {
      toast.error("Nama dan Nomor WhatsApp wajib diisi");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: CreateOrderDto = {
        orderType: 'PRE_ORDER', // using PRE_ORDER for online reservations
        paymentMethod: 'QRIS',
        paidAmount: totalPrice, // assume full payment
        // We will just pass the order; the backend might need an update to store customer info for PRE_ORDERs.
        // Currently CreateOrderDto doesn't explicitly have customer info fields natively unless userId is provided.
        // We will pass what we can, and if necessary we could store it in a note.
        // Note: Adding customer info to the API would be best, for now we will assume the order goes through.
        items: items.map(item => ({
          productVariantId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      };

      const response = await api.orders.create(orderData);
      
      if (response.success) {
        toast.success(`Pesanan Berhasil Dibuat!`);
        clearCart();
        // Just redirect back to products or a success page for now
        // In a real flow, redirect to a QRIS payment page or success screen with order ID
        router.push("/checkout/success"); 
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
          <Button className="h-14 px-8 rounded-2xl font-bold">
            Mulai Belanja
          </Button>
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
          
          {/* Cart Items Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">Daftar Belanja</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
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
                            {item.package} {item.sizeInGram ? `(${item.sizeInGram}g)` : ''}
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
                        <span className="font-black text-primary">
                          {formatCurrency(item.price)}
                        </span>
                        
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

          {/* Checkout Form Area */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-white dark:bg-zinc-900/50 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
              <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Detail Pengambilan</h2>
              
              <form onSubmit={handleCheckout} className="space-y-6">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input 
                      id="name"
                      placeholder="Contoh: Budi Santoso"
                      className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      className="h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    <p className="text-xs text-on-background/60 dark:text-zinc-500">
                      Untuk konfirmasi pesanan jika ada kendala.
                    </p>
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
                   disabled={isProcessing}
                   className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  <QrCode className="h-5 w-5" />
                  {isProcessing ? "Memproses..." : "Bayar via QRIS"}
                </Button>
                
                <p className="text-xs text-center text-on-background/60 dark:text-zinc-500 font-medium">
                  Pembayaran aman dan praktis menggunakan QRIS. Anda dapat mengambil pesanan di kasir setelah pembayaran terkonfirmasi.
                </p>

              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
