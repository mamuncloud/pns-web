"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Progress from "../ui/progress";
import { 
  TrendingUp, 
  AlertTriangle, 
  PackageX, 
  ArrowRight,
  Calculator
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface InsightItemProps {
  title: string;
  subtitle: string;
  value: string;
  percentage?: number;
  status: "success" | "warning" | "danger" | "info";
  icon: React.ElementType;
}

function InsightItem({ title, subtitle, value, percentage, status, icon: Icon }: InsightItemProps) {
  const statusColors = {
    success: "text-green-600 bg-green-50 dark:bg-green-500/10",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    danger: "text-red-600 bg-red-50 dark:bg-red-500/10",
    info: "text-sky-600 bg-sky-50 dark:bg-sky-500/10",
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
      <div className={cn("p-2.5 rounded-lg", statusColors[status])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <span className="text-sm font-black text-foreground">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {percentage !== undefined && (
          <div className="pt-2">
            <Progress value={percentage} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await getProductsFromDb(1, 100);
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const topPerformers = [...products]
    .filter(p => (p.sellingPrice || 0) > 0)
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, 2);

  const criticalIssues = [...products]
    .filter(p => (p.margin !== undefined && p.margin < 15) || (p.stockQty || 0) < 10)
    .sort((a, b) => {
      // Prioritize margin danger, then low stock
      if ((a.margin || 0) < 15 && (b.margin || 0) >= 15) return -1;
      if ((a.margin || 0) >= 15 && (b.margin || 0) < 15) return 1;
      return (a.stockQty || 0) - (b.stockQty || 0);
    })
    .slice(0, 3);

  return (
    <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-900/10 py-6 px-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Financial Intelligence
            </CardTitle>
            <CardDescription>Insight otomatis untuk optimalisasi profit.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary dark:text-primary-foreground border-primary/30 font-bold uppercase tracking-wider text-[10px] px-2 shadow-sm">
            Financial Intelligence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-100/50 dark:border-gray-800/50">
          {/* Top Performance */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Profit Performance</h4>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
              ) : topPerformers.length > 0 ? (
                topPerformers.map(p => (
                  <InsightItem 
                    key={p.id}
                    title={p.name}
                    subtitle="High demand, healthy margin"
                    value={`Rp ${((p.sellingPrice || 0) / 1000).toFixed(1)}k`}
                    percentage={Math.min(100, (p.margin || 0) * 2)} // Scaling margin to progress
                    status="success"
                    icon={TrendingUp}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No high-performing products found.</p>
              )}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="p-6 sm:p-8 space-y-5 bg-red-50/10 dark:bg-red-900/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Critical Margin & Health</h4>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
              ) : criticalIssues.length > 0 ? (
                criticalIssues.map(p => {
                  const isMarginDanger = (p.margin || 0) < 15;
                  
                  return (
                    <InsightItem 
                      key={p.id}
                      title={p.name}
                      subtitle={isMarginDanger ? `Margin too low: ${Math.round(p.margin || 0)}%` : `Stock running low: ${p.stockQty || 0} left`}
                      value={isMarginDanger ? `Margin ${Math.round(p.margin || 0)}%` : `${p.stockQty || 0} units`}
                      status={isMarginDanger ? "danger" : "warning"}
                      icon={isMarginDanger ? AlertTriangle : PackageX}
                    />
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic">No critical issues detected.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100/50 dark:border-gray-800/50">
        <Link 
          href="/dashboard/reports" 
          className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
        >
          Lihat Analisis Mendalam
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
