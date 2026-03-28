"use client";

import { useState } from "react";
import { StockMovementList } from "@/components/dashboard/stock/StockMovementList";
import { StockAdjustmentForm } from "@/components/dashboard/stock/StockAdjustmentForm";

export default function StockDashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Stock Ledger
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Catatan historis seluruh pergerakan stok dari transaksi kasir, pembelian supplier, maupun repack barang.
          </p>
        </div>
      </div>

      <div className="w-full">
        <StockAdjustmentForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
      </div>

      <div className="w-full">
        <StockMovementList limit={100} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
