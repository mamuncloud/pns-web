"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
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
  color: "primary" | "success" | "warning" | "info";
}

const colorMap = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  info: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};

function StatCard({ title, value, description, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl border", colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
              trend.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              {trend.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Today's Sales"
        value="Rp 4.250.000"
        description="Compared to yesterday"
        icon={ShoppingCart}
        color="primary"
        trend={{ value: "12.5%", isUp: true }}
      />
      <StatCard
        title="Active Orders"
        value="24"
        description="Pending shipments"
        icon={TrendingUp}
        color="info"
        trend={{ value: "4", isUp: true }}
      />
      <StatCard
        title="Total Customers"
        value="1,240"
        description="Lifetime customers"
        icon={Users}
        color="success"
        trend={{ value: "2.1%", isUp: true }}
      />
      <StatCard
        title="Low Stock Items"
        value="8"
        description="Requires immediate action"
        icon={AlertTriangle}
        color="warning"
        trend={{ value: "2", isUp: false }}
      />
    </div>
  );
}
