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
  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-900/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Financial Intelligence
            </CardTitle>
            <CardDescription>Insight otomatis untuk optimalisasi profit.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider text-[10px] px-2">
            AI Insight
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-100 dark:border-gray-800">
          {/* Top Performance */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Profit Performance</h4>
            </div>
            <div className="space-y-3">
              <InsightItem 
                title="Keripik Singkong Pedas"
                subtitle="High demand, healthy margin"
                value="Rp 1.2M"
                percentage={85}
                status="success"
                icon={TrendingUp}
              />
              <InsightItem 
                title="Basreng Jeruk"
                subtitle="Best seller this week"
                value="Rp 850k"
                percentage={70}
                status="success"
                icon={TrendingUp}
              />
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="p-6 space-y-4 bg-red-50/10 dark:bg-red-900/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Critical Margin & Health</h4>
            </div>
            <div className="space-y-3">
              <InsightItem 
                title="Makaroni Bantet"
                subtitle="Margin drop by 5% due to HPP increase"
                value="Margin 12%"
                status="danger"
                icon={AlertTriangle}
              />
              <InsightItem 
                title="Cireng Chips"
                subtitle="No sales for 14 days (Dead stock)"
                value="52 units"
                status="warning"
                icon={PackageX}
              />
              <InsightItem 
                title="Defect Inventory"
                subtitle="Highest loss contributor this month"
                value="Rp 320k"
                status="danger"
                icon={PackageX}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
        <Link 
          href="/dashboard/reports" 
          className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
        >
          Lihat Analisis Mendalam
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
