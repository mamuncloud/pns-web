"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Customer } from "@/types/financial";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users,
  Phone,
  Mail,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.customers.list(currentPage, LIMIT, debouncedSearch, sortBy, sortOrder);
      setCustomers(res.data.data);
      setTotalCount(res.data.meta?.totalItems || 0);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Customer Monitor
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Pantau data pelanggan yang terdaftar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {totalCount} Pelanggan
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari nama atau nomor telepon..." 
            className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
          <SelectTrigger className="w-full md:w-[200px] h-14 rounded-2xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 font-medium">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Tanggal Daftar</SelectItem>
            <SelectItem value="name">Nama</SelectItem>
            <SelectItem value="totalOrders">Total Pesanan</SelectItem>
            <SelectItem value="totalSpent">Total Belanja</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")}>
          <SelectTrigger className="w-full md:w-[140px] h-14 rounded-2xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 font-medium">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Urutan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Pelanggan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Kontak</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Total Pesanan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Total Belanja</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Terakhir Beli</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Anggota Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <p className="text-sm font-black uppercase tracking-widest animate-pulse text-muted-foreground/30">Memuat data pelanggan...</p>
                  </td>
                </tr>
              ) : !customers || customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Tidak ada pelanggan ditemukan</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
                          {(customer.name || customer.phone || "C")?.[0]?.toUpperCase() || "C"}
                        </div>
                        <p className="text-sm font-bold text-foreground">{customer.name || "Customer"}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {customer.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </p>
                        )}
                        {customer.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </p>
                        )}
                        {!customer.phone && !customer.email && (
                          <p className="text-xs text-muted-foreground">-</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-foreground">{customer.totalOrders} Trx</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-foreground">{formatCurrency(customer.totalSpent)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatDate(customer.lastOrderDate)}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatDate(customer.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
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
    </div>
  );
}
