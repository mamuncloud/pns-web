"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Purchase } from "@/types/financial";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, Receipt, Calendar, User, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function PurchaseHistory() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const response = await api.purchases.list();
      if (response.success) {
        setPurchases(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground font-medium">Memuat riwayat...</span>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">Belum ada riwayat pembelian.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Badge variant="outline" className="px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20 backdrop-blur-sm">
          Total: {purchases.length} Transaksi
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Package className="w-4 h-4 mr-2 text-primary" />
              Total Belanja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(purchases.reduce((acc, p) => acc + p.totalAmount, 0))}
            </div>
          </CardContent>
        </Card>
        {/* Placeholder cards if needed */}
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-white/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-950/50 border-y border-gray-100 dark:border-gray-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Tanggal</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Supplier</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Total Item</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Total Nominal</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow 
                  key={purchase.id} 
                  className="group cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-900/50 transition-all duration-300 border-b border-gray-100 dark:border-gray-800"
                  onClick={() => router.push(`/dashboard/purchases/${purchase.id}`)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="flex items-center text-sm font-semibold text-gray-900">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary opacity-70" />
                        {format(new Date(purchase.date), "dd MMM yyyy", { locale: localeId })}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-5">
                        {format(new Date(purchase.createdAt), "HH:mm")} WIB
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium text-gray-700">
                      <User className="w-3.5 h-3.5 mr-1.5 text-primary opacity-70" />
                      {purchase.supplier?.name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-tighter bg-primary/5 text-primary border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300 rounded-lg">
                      {purchase.items?.length || 0} Prod
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(purchase.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-lg border-2 transition-all shadow-sm",
                        purchase.status === 'COMPLETED' 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400"
                      )}
                    >
                      {purchase.status === 'COMPLETED' ? 'CONFIRMED' : 'DRAFT'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground italic text-sm max-w-[200px] truncate">
                    {purchase.note || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
