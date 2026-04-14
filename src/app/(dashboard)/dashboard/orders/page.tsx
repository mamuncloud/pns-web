"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Order, OrderSummary, OrderStatus } from "@/types/financial";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  CreditCard, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Filter,
  PackageCheck,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "Semua", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
];

function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "CASH": return "Cash";
    case "EDC_BCA": return "EDC BCA";
    case "MAYAR": return "QRIS Mayar";
    default: return method;
  }
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{
    orderId: string;
    newStatus: string;
    title: string;
    description: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, summaryRes] = await Promise.all([
        api.orders.list(currentPage, LIMIT, debouncedSearch),
        api.orders.getSummary()
      ]);
      setOrders(ordersRes.data);
      setSummary(summaryRes.data);
      
      if (ordersRes.meta) {
        setTotalPages(ordersRes.meta.totalPages as number);
      }
    } catch (error) {
      console.error("Failed to fetch order data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      toast.success(`Status pesanan berhasil diubah ke ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Gagal mengubah status pesanan.");
    }
  };

  const promptStatusChange = (orderId: string, newStatus: string) => {
    const configs: Record<string, { title: string; description: string }> = {
      READY: {
        title: "Siapkan Pesanan?",
        description: "Tandai pesanan ini sebagai SIAP untuk diambil pelanggan.",
      },
      COMPLETED: {
        title: "Selesaikan Pesanan?",
        description: "Tandai pesanan ini sebagai SELESAI (pelanggan sudah mengambil).",
      },
      CANCELLED: {
        title: "Batalkan Pesanan?",
        description: "Batalkan pesanan ini. Tindakan ini tidak dapat dibatalkan.",
      },
    };
    const config = configs[newStatus] || { title: "Update Status?", description: "" };
    setConfirmAction({ orderId, newStatus, ...config });
  };

  const filteredOrders = activeTab === "ALL" 
    ? orders 
    : orders.filter((o) => o.status === activeTab);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Order Management
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Pantau semua transaksi masuk dari POS dan Order Online.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-500/10 border-green-200 dark:border-green-500/20">
                Revenue
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-black mt-1">{summary ? formatCurrency(summary.totalRevenue) : "Rp 0"}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20">
                Orders
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
              <h3 className="text-2xl font-black mt-1">{summary?.totalOrders || 0} Trx</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20">
                Pending
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Menunggu Pembayaran</p>
              <h3 className="text-2xl font-black mt-1">{summary?.pendingOrders || 0} Trx</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600 border border-sky-500/20">
                <CreditCard className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-sky-50 text-sky-600 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20">
                POS vs Online
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">POS Revenue</p>
              <h3 className="text-2xl font-black mt-1">{summary ? formatCurrency(summary.walkInRevenue) : "Rp 0"}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-10 px-5 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 transition-all duration-300",
              activeTab === tab.value
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 hover:border-primary/30"
            )}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari nama pembeli atau ID pesanan..." 
            className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 font-bold bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Order List */}
      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">ID & Tanggal</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Tipe & Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Total</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <p className="text-sm font-black uppercase tracking-widest animate-pulse text-muted-foreground/30">Memuat data pesanan...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Tidak ada pesanan ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">#{order.id.slice(0, 8)}</p>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                         })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-foreground">{order.customerName || "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone || "-"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px] py-0 px-2 h-auto uppercase font-black tracking-wider border-none",
                            order.orderType === 'WALK_IN' ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"
                          )}>
                            {order.orderType === 'WALK_IN' ? "POS" : "Online"}
                          </Badge>
                          <Badge className={cn(
                            "text-[10px] py-0 px-2 h-auto uppercase font-black tracking-wider",
                            getStatusColor(order.status)
                          )}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground">
                          Metode: <span className="font-bold">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-base font-black text-foreground">{formatCurrency(order.totalAmount)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status action buttons for PRE_ORDER fulfillment */}
                        {order.status === 'PAID' && (
                          <Button
                            size="sm"
                            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20"
                            onClick={() => promptStatusChange(order.id, 'READY')}
                          >
                            <PackageCheck className="h-3.5 w-3.5 mr-1" />
                            Siapkan
                          </Button>
                        )}
                        {order.status === 'READY' && (
                          <Button
                            size="sm"
                            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20"
                            onClick={() => promptStatusChange(order.id, 'COMPLETED')}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Selesai
                          </Button>
                        )}
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary group-hover:bg-primary/10 transition-all">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Show only current, first, last, and pages around current
                if (
                  p === 1 || 
                  p === totalPages || 
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(p)}
                        isActive={currentPage === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (p === currentPage - 2 || p === currentPage + 2) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        title={confirmAction?.title || ""}
        description={confirmAction?.description || ""}
        onConfirm={() => {
          if (confirmAction) {
            handleStatusUpdate(confirmAction.orderId, confirmAction.newStatus);
          }
        }}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
      />
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20";
    case "PAID":
      return "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20";
    case "READY":
      return "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20";
    case "PENDING":
      return "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20";
    default:
      return "bg-gray-500 text-white";
  }
}
