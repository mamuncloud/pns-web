"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color: "primary" | "success" | "warning" | "info" | "danger";
}

const colorMap = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  info: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  danger: "bg-red-500/10 text-red-600 border-red-500/20",
};

function StatCard({ title, value, description, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl border transition-colors", colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
              trend.isUp ? "bg-green-50 text-green-600 dark:bg-green-500/10" : "bg-red-50 text-red-600 dark:bg-red-500/10"
            )}>
              {trend.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value="Rp 12.450.000"
        description="Total penjualan hari ini"
        icon={ShoppingCart}
        color="primary"
        trend={{ value: "8.2%", isUp: true }}
      />
      <StatCard
        title="Total HPP"
        value="Rp 8.120.000"
        description="Estimasi modal barang terjual"
        icon={Package}
        color="info"
        trend={{ value: "5.4%", isUp: true }}
      />
      <StatCard
        title="Total Profit"
        value="Rp 4.330.000"
        description="Keuntungan bersih estimasi"
        icon={TrendingUp}
        color="success"
        trend={{ value: "12.5%", isUp: true }}
      />
      <StatCard
        title="Total Loss (Kerugian)"
        value="Rp 450.000"
        description="Barang rusak / expired"
        icon={AlertTriangle}
        color="danger"
        trend={{ value: "Rp 120k", isUp: false }}
      />
    </div>
  );
}
