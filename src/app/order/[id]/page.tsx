"use client";

import { useEffect, useState, use, Fragment } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Receipt, 
  QrCode, 
  ExternalLink, 
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{h: string, m: string, s: string} | "EXPIRED" | null>(null);

  // Countdown timer logic
  useEffect(() => {
    if (!order?.payment?.expiresAt || order.status !== 'PENDING') {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(order.payment.expiresAt).getTime() - now;

      if (distance < 0) {
        setTimeRemaining("EXPIRED");
        clearInterval(interval);
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');

      setTimeRemaining({ h, m, s });
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.payment?.expiresAt, order?.status]);

  const fetchOrder = async () => {
    try {
      const response = await api.orders.getPublic(resolvedParams.id);
      setOrder(response.data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Pesanan tidak ditemukan. Pastikan link yang Anda gunakan benar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Auto-refresh for pending orders to detect payment success
    let interval: NodeJS.Timeout;
    if (order?.status === 'PENDING') {
      interval = setInterval(fetchOrder, 10000); // Check every 10 seconds
    }
    return () => clearInterval(interval);
  }, [resolvedParams.id, order?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground animate-pulse font-medium">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2">Aduh! Ada Masalah</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">{error || "Kami tidak dapat menemukan data pesanan ini."}</p>
        <Link href="/">
          <Button variant="outline" className="h-12 px-8 rounded-2xl font-bold"> Kembali Berbelanja </Button>
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'PAID';
  const isPending = order.status === 'PENDING';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-32">
        {/* Top Banner - Using storefront premium gradient */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className={cn(
            "relative overflow-hidden rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl transition-all duration-700",
            isPaid ? "bg-gradient-to-r from-emerald-600 to-emerald-400" : isCancelled ? "bg-zinc-600" : "bg-gradient-to-r from-primary to-[#FF8A65]"
          )}>
            <div className="z-10 relative space-y-3 text-center md:text-left">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                {isPaid ? "📦 Siap Diambil" : isCancelled ? "✖️ Dibatalkan" : "⏳ Menunggu Pembayaran"}
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight">
                {isPaid ? "Pembayaran Sukses!" : isCancelled ? "Order Dibatalkan" : "Pesanan Diterima"}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-white/80 font-bold text-sm lg:text-base opacity-90">
                <span className="opacity-70 whitespace-nowrap">Order ID:</span>
                <code className="bg-white/10 px-3 py-1 rounded-lg font-mono text-xs sm:text-sm tracking-wide break-all">
                  {order.id}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(order.id);
                    setCopied(true);
                    toast.success("ID pesanan telah disalin ke clipboard Anda.");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all group active:scale-90 shrink-0"
                  title="Salin ID Pesanan"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />}
                </button>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 relative z-10">
              <div className="h-24 w-24 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center animate-float">
                {isPaid ? <CheckCircle2 className="h-12 w-12 text-white" /> : <Clock className="h-12 w-12 text-white animate-pulse" />}
              </div>
            </div>
            
            {/* Abstract decorations like on Product Page */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Status & Timeline Card */}
            <Card className="border-none bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden animate-stagger">
              <CardContent className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-12 relative px-4">
                  <div className="absolute top-4 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 z-0"></div>
                  
                  {[
                    { label: "Checkout", icon: CheckCircle2, active: true, completed: true },
                    { label: "Pembayaran", icon: Receipt, active: isPending || isPaid, completed: isPaid },
                    { label: "Diproses", icon: Package, active: isPaid, completed: false }
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500",
                        step.completed ? "bg-primary text-white" : step.active ? "bg-primary text-white ring-8 ring-primary/10 shadow-lg shadow-primary/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      )}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        step.active ? "text-primary" : "text-zinc-400"
                      )}>{step.label}</span>
                    </div>
                  ))}
                </div>

                {isPending && order.payment?.directPaymentUrl && (
                  <div className="bg-primary/[0.03] border border-primary/10 rounded-[2.5rem] p-10 mb-8 overflow-hidden relative group">
                    <div className="relative z-10 flex flex-col gap-8">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em] mb-1">
                          {timeRemaining === "EXPIRED" ? <AlertCircle className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                          {timeRemaining === "EXPIRED" ? "Payment Expired" : "Action Required"}
                        </div>
                        <h4 className="font-headline text-3xl font-black text-dark dark:text-white tracking-tight">
                          {timeRemaining === "EXPIRED" ? "Waktu Pembayaran Habis" : "Selesaikan Pembayaran"}
                        </h4>
                        <p className="text-base text-on-background/60 dark:text-zinc-400 font-medium max-w-sm leading-relaxed">
                          {timeRemaining === "EXPIRED" 
                            ? "Link QRIS ini sudah tidak berlaku. Silakan buat pesanan baru untuk melanjutkan."
                            : "Scan QRIS menggunakan aplikasi bank atau e-wallet pilihanmu sebelum batas waktu habis."}
                        </p>
                      </div>

                      {timeRemaining && timeRemaining !== "EXPIRED" && (
                        <div className="flex flex-col gap-8">
                          <div className="flex flex-col gap-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 text-center md:text-left">Sisa Waktu Pembayaran</p>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                              {[
                                { label: 'JAM', value: timeRemaining.h },
                                { label: 'MENIT', value: timeRemaining.m },
                                { label: 'DETIK', value: timeRemaining.s },
                              ].map((unit, i) => (
                                <Fragment key={unit.label}>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white dark:bg-zinc-800 border border-primary/10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 transition-transform hover:scale-105">
                                      <span className="text-3xl sm:text-4xl font-headline font-black text-primary tabular-nums tracking-tighter">
                                        {unit.value}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-black tracking-widest text-zinc-400 opacity-60 uppercase">{unit.label}</span>
                                  </div>
                                  {i < 2 && (
                                    <div className="h-20 sm:h-24 flex items-center mb-6">
                                      <span className="text-2xl font-black text-primary/20 animate-pulse">:</span>
                                    </div>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                             <a 
                              href={order.payment.directPaymentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-3 px-12 h-16 w-full md:w-auto bg-primary hover:bg-[#B71C1C] text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                            >
                              Bayar Via QRIS <ExternalLink className="h-6 w-6" />
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {timeRemaining === "EXPIRED" && (
                        <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                             <Clock className="h-7 w-7" />
                          </div>
                          <div>
                             <p className="font-headline font-black text-red-600 text-xl tracking-tight">Link Pembayaran Kadaluarsa</p>
                             <p className="text-sm text-red-900/60 dark:text-red-400/60 font-medium">Waktu Anda telah habis. Silakan buat pesanan baru untuk mendapatkan link QRIS yang baru.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Background decoration */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
                  </div>
                )}

                {isPaid && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 mb-8 text-center sm:text-left sm:flex items-center justify-between gap-6">
                    <div className="space-y-2 mb-6 sm:mb-0">
                      <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-1">
                        <MessageCircle className="h-4 w-4" /> Ready for pickup
                      </div>
                      <h4 className="font-headline text-2xl font-black text-emerald-950 dark:text-emerald-300">Siap Diambil</h4>
                      <p className="text-sm text-emerald-900/60 dark:text-emerald-400/60 font-medium max-w-xs">Pembayaran terverifikasi. Silakan tunjukkan halaman ini ke kasir.</p>
                    </div>
                    <a 
                      href={`https://wa.me/6285800342727?text=Halo%20Planet%20Nyemil!%20Saya%20sudah%20bayar%20untuk%20Order%20%23${order.orderNumber}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 px-10 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-base shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                    >
                      Hubungi WA <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8 border-t border-zinc-50 dark:border-zinc-800 pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black">Nama Pelanggan</p>
                    <p className="text-lg font-black text-dark dark:text-white capitalize">{order.customerName}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black">Waktu Pesan</p>
                    <p className="text-lg font-black text-dark dark:text-white">
                      {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, HH:mm') : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card className="border-none bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden animate-stagger" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <CardTitle className="font-headline text-2xl font-black">Ringkasan Pesanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800 px-8">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-6 flex items-center justify-between group">
                      <div className="flex gap-5 items-center">
                        <div className="h-16 w-16 rounded-[1.25rem] bg-[#F8F9FA] dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <ShoppingBag className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-headline font-black text-lg group-hover:text-primary transition-colors">{item.productName}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{item.package}</span>
                             <span className="text-sm font-bold text-zinc-400">×{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-black text-lg">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="m-8 p-10 bg-[#F8F9FA] dark:bg-zinc-950/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</p>
                    <p className="font-black text-lg">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <Separator className="bg-zinc-200/50 dark:bg-zinc-800" />
                  <div className="flex items-center justify-between">
                    <p className="font-headline font-black text-2xl tracking-tighter">Total Bayar</p>
                    <p className="font-headline font-black text-3xl text-primary tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="border-none bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden p-8 animate-stagger" style={{ animationDelay: '0.3s' }}>
                <h3 className="font-headline text-2xl font-black mb-6">Menu Unggulan</h3>
                <div className="space-y-4">
                  <Link href="/products" className="group flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-secondary dark:bg-zinc-800 flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                     </div>
                     <span className="font-black text-lg group-hover:text-primary transition-colors">Belanja Lagi</span>
                  </Link>
                  <Link href="/" className="group flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-secondary dark:bg-zinc-800 flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <ArrowLeft className="h-7 w-7 text-primary" />
                     </div>
                     <span className="font-black text-lg group-hover:text-primary transition-colors">Ke Beranda</span>
                  </Link>
                </div>
             </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
