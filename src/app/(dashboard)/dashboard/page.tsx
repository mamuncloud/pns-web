"use client";

import { useAuth } from "@/hooks/use-auth";
import StatCards from "@/components/dashboard/StatCards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";

const recentActivities = [
  { id: 1, type: "order", title: "New Order #1245", time: "2 minutes ago", status: "PENDING", amount: "Rp 150.000" },
  { id: 2, type: "stock", title: "Stock Update: Keripik Singkong", time: "45 minutes ago", status: "UPDATED", amount: "+50 units" },
  { id: 3, type: "order", title: "Order #1243 Delivered", time: "2 hours ago", status: "COMPLETED", amount: "Rp 75.000" },
  { id: 4, type: "user", title: "New Partner Approval", time: "5 hours ago", status: "APPROVED", amount: null },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Selamat Datang, {user?.name || "Staff"}! 👋
          </h2>
          <p className="text-muted-foreground">
            Inilah ringkasan aktivitas toko hari ini.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Store is Open
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Aktivitas Terkini</CardTitle>
              <CardDescription>Transaksi dan log terbaru dari sistem.</CardDescription>
            </div>
            <Link href="/dashboard/logs" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 group">
              Lihat Semua
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center dark:bg-gray-800">
                      {activity.type === 'order' ? <Package className="h-5 w-5 text-sky-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-bold text-foreground mb-1">{activity.amount}</p>
                    )}
                    <Badge variant={activity.status === 'PENDING' ? 'destructive' : 'secondary'} className="text-[10px] py-0 px-1.5 h-auto uppercase">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Aksi Cepat</CardTitle>
            <CardDescription>Shortcut ke fitur yang sering digunakan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between h-12 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/30 transition-all dark:bg-gray-800/30 group">
              <span className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                Tambah Produk
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
            <Button variant="outline" className="w-full justify-between h-12 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/30 transition-all dark:bg-gray-800/30 group">
              <span className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Input Penjualan
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
            <Link href="/partner" className="block">
              <Button variant="outline" className="w-full justify-between h-12 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/30 transition-all dark:bg-gray-800/30 group">
                <span className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  Persetujuan Partner
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
