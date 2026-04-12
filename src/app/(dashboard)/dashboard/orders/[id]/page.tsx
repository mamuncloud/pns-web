"use client";

import { use, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Order } from "@/types/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  ChevronLeft, 
  CreditCard, 
  User, 
  RefreshCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Package,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.orders.get(id);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <RefreshCcw className="h-6 w-6 text-primary animate-spin" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold">Pesanan tidak ditemukan</h2>
        <Link href="/dashboard/orders" className="text-primary hover:underline mt-4 inline-block">
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Pesanan
          </Link>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
              Order #{order.id.slice(0, 8)}
            </h2>
            <Badge className={cn(
              "text-xs px-3 py-1 uppercase font-black tracking-widest rounded-full",
              getStatusColor(order.status)
            )}>
              {order.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl font-bold h-12 px-6">
            Print HTML
          </Button>
          <Button className="rounded-2xl font-bold h-12 px-6 gap-2">
            Mark as Completed
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Item List */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Rincian Barang</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Produk</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Harga</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-center">Jumlah</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                    {order.items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-foreground">{item.productName}</p>
                          <Badge variant="secondary" className="mt-1 text-[10px] py-0 px-2 h-auto tracking-widest font-black uppercase bg-gray-100/50">
                            {item.package}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right font-medium text-sm">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-sm">
                          x{item.quantity}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="text-sm font-black text-foreground">{formatCurrency(item.subtotal)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50/30 dark:bg-gray-900/30">
                      <td colSpan={3} className="px-8 py-6 text-right text-sm font-bold text-muted-foreground uppercase tracking-widest">Grand Total</td>
                      <td className="px-8 py-6 text-right text-xl font-black text-primary">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline (Visual Placeholder for now) */}
          <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Timeline Pesanan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
                  <div className="h-10 w-10 rounded-full bg-green-500/10 border-2 border-green-500 z-10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="pt-1 flex-1">
                    <p className="text-sm font-black text-foreground italic uppercase">Pesanan Dibuat</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {new Date(order.createdAt).toLocaleString("id-ID", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full z-10 flex items-center justify-center",
                    order.status === 'PAID' || order.status === 'COMPLETED' 
                      ? "bg-green-500/10 border-2 border-green-500" 
                      : "bg-amber-500/10 border-2 border-amber-500"
                  )}>
                    {order.status === 'PAID' || order.status === 'COMPLETED' 
                      ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                      : <Clock className="h-5 w-5 text-amber-600" />
                    }
                  </div>
                  <div className="pt-1 flex-1">
                    <p className="text-sm font-black text-foreground italic uppercase">
                      {order.status === 'PAID' || order.status === 'COMPLETED' ? "Pembayaran Sukses" : "Menunggu Pembayaran"}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {order.paymentMethod} Payment Mode
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar content */}
        <div className="space-y-8">
          {/* Customer Details */}
          <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-tight italic">Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Nama</p>
                <p className="text-lg font-bold text-foreground">{order.customerName || "Walk-in Guest"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Telepon</p>
                <p className="text-lg font-bold text-foreground font-mono">{order.customerPhone || "-"}</p>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Order Type</p>
                 <Badge variant="outline" className="text-[10px] py-1 px-3 h-auto uppercase font-black tracking-widest border-primary/20 bg-primary/5 text-primary">
                    {order.orderType}
                 </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Card */}
          <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t-4 border-t-primary">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-tight italic">Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
                <span className="text-xs font-bold text-muted-foreground uppercase">Metode</span>
                <span className="text-sm font-black text-foreground tracking-widest uppercase">{order.paymentMethod}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Extra Fees</span>
                  <span className="font-bold">{formatCurrency(0)}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              {order.payment?.paymentUrl && order.status === 'PENDING' && (
                <a 
                  href={order.payment.paymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full h-12 rounded-2xl font-black uppercase tracking-widest"
                  )}
                >
                  Buka Link Pembayaran
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20";
    case "PENDING":
      return "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20";
    case "READY":
      return "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20";
    default:
      return "bg-gray-500 text-white";
  }
}
