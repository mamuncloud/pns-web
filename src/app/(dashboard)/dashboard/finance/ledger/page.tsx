"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Download,
  RefreshCcw,
  History,
  TrendingUp,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FinancialTransaction, TransactionCategory } from "@/types/financial";
import { cn } from "@/lib/utils";
import { RecordAdjustmentModal } from "@/components/finance/RecordAdjustmentModal";
import { RecordExpenseModal } from "@/components/finance/RecordExpenseModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 20;

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "SALES", label: "Sales" },
  { value: "STOCK_PURCHASE", label: "Stock Purchase" },
  { value: "OPERATIONAL_EXPENSE", label: "Operational Expense" },
  { value: "CAPITAL_INJECTION", label: "Capital Injection" },
  { value: "OTHER", label: "Other" },
];

export default function FinancialLedgerPage() {
  const [ledger, setLedger] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== "ALL") params.type = typeFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.finance.ledger(params);
      setLedger(response.data);
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, startDate, endDate]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const filteredLedger = useMemo(() => {
    if (!debouncedSearch) return ledger;
    const query = debouncedSearch.toLowerCase();
    return ledger.filter(item => 
      item.description?.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) ||
      item.referenceId?.toLowerCase().includes(query) ||
      item.employee?.name?.toLowerCase().includes(query)
    );
  }, [ledger, debouncedSearch]);

  const totalPages = Math.ceil(filteredLedger.length / ITEMS_PER_PAGE);
  const paginatedLedger = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLedger.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLedger, currentPage]);

  const hasActiveFilters = typeFilter !== "ALL" || categoryFilter !== "all" || startDate || endDate || debouncedSearch;

  const exportCSV = () => {
    const headers = ["Date", "Time", "Type", "Category", "Description", "Reference", "Employee", "Amount"];
    const rows = filteredLedger.map(item => [
      format(new Date(item.date), "yyyy-MM-dd"),
      format(new Date(item.date), "HH:mm"),
      item.type,
      item.category,
      `"${(item.description || "").replace(/"/g, '""')}"`,
      item.referenceId || "",
      item.employee?.name || "System",
      item.amount,
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEmptyMessage = () => {
    if (loading) return null;
    if (hasActiveFilters) return "No transactions match your current filters. Try adjusting your search criteria.";
    return "No transactions found. Start by recording an expense or adjusting the balance.";
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Transaction Ledger
          </h2>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <History className="w-4 h-4" />
            Comprehensive audit trail of all store cash movements.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="h-11 px-6 rounded-xl border-2 hover:bg-muted font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/5" 
            onClick={fetchLedger}
            disabled={loading}
          >
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Sync Data
          </Button>
          <Button 
            variant="default" 
            className="h-11 px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-extrabold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
            onClick={exportCSV}
            disabled={filteredLedger.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <RecordAdjustmentModal 
        open={showAdjustmentModal}
        onOpenChange={setShowAdjustmentModal}
        onSuccess={fetchLedger}
      />

      <RecordExpenseModal 
        open={showExpenseModal}
        onOpenChange={setShowExpenseModal}
        onSuccess={fetchLedger}
      />

      <Card className="rounded-3xl border shadow-2xl shadow-black/5 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-6 border-b bg-muted/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by description, category, or reference..." 
                className="pl-12 h-12 bg-background/50 border-2 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <div className="flex items-center gap-1 bg-background/50 p-1 rounded-full border-2">
                  <Button 
                    variant={typeFilter === "ALL" ? "default" : "ghost"} 
                    size="sm"
                    className="rounded-full px-5 h-8 font-bold text-[10px] uppercase tracking-wider"
                    onClick={() => { setTypeFilter("ALL"); setCurrentPage(1); }}
                  >
                    All
                  </Button>
                  <Button 
                    variant={typeFilter === "INCOME" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-5 h-8 font-bold text-[10px] uppercase tracking-wider",
                      typeFilter !== "INCOME" && "text-green-600 hover:bg-green-50"
                    )}
                    onClick={() => { setTypeFilter("INCOME"); setCurrentPage(1); }}
                  >
                    Income
                  </Button>
                  <Button 
                    variant={typeFilter === "EXPENSE" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-5 h-8 font-bold text-[10px] uppercase tracking-wider",
                      typeFilter !== "EXPENSE" && "text-red-600 hover:bg-red-50"
                    )}
                    onClick={() => { setTypeFilter("EXPENSE"); setCurrentPage(1); }}
                  >
                    Expense
                  </Button>
               </div>
               
               <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 border-2 rounded-xl px-3 font-bold text-[10px] uppercase tracking-wider",
                  showFilters ? "bg-primary/10 border-primary/30 text-primary" : "border-border"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filters
              </Button>

               <div className="h-8 w-px bg-border mx-1 hidden md:block" />

               <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 border-2 border-primary/20 font-black uppercase text-[10px] tracking-tight hover:bg-primary/5 rounded-xl px-4"
                    onClick={() => setShowExpenseModal(true)}
                  >
                    <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-primary" /> Record Expense
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 border-2 border-orange-500/20 font-black uppercase text-[10px] tracking-tight hover:bg-orange-500/5 text-orange-600 rounded-xl px-4"
                    onClick={() => setShowAdjustmentModal(true)}
                  >
                    <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" /> Adjust Balance
                  </Button>
               </div>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-wider">Category</label>
                <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-11 bg-background/50 border-2 rounded-xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border rounded-xl shadow-2xl">
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="font-bold text-xs uppercase tracking-tight">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Start Date
                </label>
                <Input 
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="h-11 bg-background/50 border-2 rounded-xl"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> End Date
                </label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="h-11 bg-background/50 border-2 rounded-xl"
                />
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-11 px-4 text-muted-foreground hover:text-destructive font-bold text-xs uppercase tracking-wider"
                    onClick={() => {
                      setTypeFilter("ALL");
                      setCategoryFilter("all");
                      setStartDate("");
                      setEndDate("");
                      setSearch("");
                      setCurrentPage(1);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold">{filteredLedger.length}</span>
              <span>result{filteredLedger.length !== 1 ? "s" : ""} found</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[180px] font-black uppercase text-xs tracking-widest pl-6">Date</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-widest text-center">Type</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-widest">Category</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-widest">Description</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-widest text-right pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    <TableCell className="pl-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24 rounded-lg" />
                        <Skeleton className="h-3 w-12 rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Skeleton className="h-5 w-12 rounded-full mx-auto" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-6 w-28 rounded-md" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48 rounded-lg" />
                        <Skeleton className="h-3 w-24 rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Skeleton className="h-5 w-24 ml-auto rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLedger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-muted rounded-full">
                        <History className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium italic">{getEmptyMessage()}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLedger.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0 cursor-default">
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{format(new Date(item.date), "dd MMM yyyy")}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">{format(new Date(item.date), "HH:mm")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       {item.type === "INCOME" ? (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                           <ArrowUpRight className="w-3 h-3" />
                           In
                         </div>
                       ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                           <ArrowDownLeft className="w-3 h-3" />
                           Out
                        </div>
                       )}
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-md font-bold uppercase text-[10px] tracking-widest border-2">
                         {item.category.replace(/_/g, ' ')}
                       </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                       <div className="flex flex-col">
                         <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.description || "No description"}</span>
                         <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tight">
                            Ref: {item.referenceId?.slice(0, 8) || "Manual Entry"}
                         </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className={cn(
                        "text-sm font-black tracking-tighter",
                        item.type === "INCOME" ? "text-green-600" : "text-red-600"
                      )}>
                        {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLedger.length)} of {filteredLedger.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-2"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, idx, arr) => (
                    <div key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="w-9 text-center text-xs text-muted-foreground">…</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 w-9 rounded-xl font-bold text-xs p-0",
                          currentPage !== page && "border-2"
                        )}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl border-2"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
