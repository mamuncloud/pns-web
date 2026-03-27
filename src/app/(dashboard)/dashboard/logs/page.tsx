"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ShieldAlert, 
  FileEdit, 
  Trash2, 
  Server, 
  MonitorSmartphone, 
  Key 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dummyLogs = [
  {
    id: "LOG-1024",
    timestamp: "2026-03-27T10:24:00Z",
    user: "Dewi Lestari",
    role: "MANAGER",
    action: "UPDATE",
    entity: "productVariants",
    description: "Memperbarui harga jual dan stok pada varian '1kg' (Keripik Singkong Pedas). Stok bertambah +50.",
    status: "success",
    ip: "192.168.1.45",
    device: "Desktop - Chrome",
    icon: FileEdit
  },
  {
    id: "LOG-1023",
    timestamp: "2026-03-27T09:12:30Z",
    user: "Budi Santoso",
    role: "CASHIER",
    action: "UPDATE",
    entity: "orders",
    description: "Mengubah status pesanan WALK_IN (ORD-20260327-011) dari PENDING menjadi PAID.",
    status: "success",
    ip: "192.168.1.102",
    device: "Tablet - Safari",
    icon: FileEdit
  },
  {
    id: "LOG-1022",
    timestamp: "2026-03-27T08:45:15Z",
    user: "Siti Rahma",
    role: "MANAGER",
    action: "CREATE",
    entity: "purchases",
    description: "Membuat draft Purchase Order baru untuk Supplier 'Sinar Makmur' dengan total amount Rp 2.500.000.",
    status: "success",
    ip: "192.168.1.20",
    device: "Desktop - Edge",
    icon: Server
  },
  {
    id: "LOG-1021",
    timestamp: "2026-03-26T23:10:05Z",
    user: "System",
    role: "System",
    action: "UPDATE",
    entity: "loyaltyPoints",
    description: "Gagal memproses penukaran (REDEEM) 500 poin untuk user ID: USR-8821. Saldo tidak mencukupi.",
    status: "error",
    ip: "localhost",
    device: "Server Worker",
    icon: ShieldAlert
  },
  {
    id: "LOG-1020",
    timestamp: "2026-03-26T14:20:00Z",
    user: "Ahmad Subarjo",
    role: "MANAGER",
    action: "DELETE",
    entity: "pricingRules",
    description: "Menghapus aturan harga BULK (Grosir) untuk produk 'Basreng Gurih'.",
    status: "warning",
    ip: "192.168.1.5",
    device: "Desktop - Chrome",
    icon: Trash2
  },
  {
    id: "LOG-1019",
    timestamp: "2026-03-26T08:00:30Z",
    user: "Admin System",
    role: "MANAGER",
    action: "UPDATE",
    entity: "storeSettings",
    description: "Mengubah status isStoreOpen menjadi TRUE (Toko dibuka untuk transaksi).",
    status: "success",
    ip: "192.168.1.5",
    device: "Desktop - Chrome",
    icon: Key
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-none">Success</Badge>;
    case "warning":
      return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border-none">Warning</Badge>;
    case "error":
      return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 shadow-none border-none">Error</Badge>;
    default:
      return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 shadow-none border-none">Info</Badge>;
  }
};

const getActionBadge = (action: string) => {
  switch (action) {
    case "CREATE":
      return <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400">CREATE</Badge>;
    case "UPDATE":
      return <Badge variant="outline" className="border-indigo-500/30 text-indigo-600 dark:text-indigo-400">UPDATE</Badge>;
    case "DELETE":
      return <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400">DELETE</Badge>;
    case "SYNC":
      return <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400">SYNC</Badge>;
    case "LOGIN_FAILED":
      return <Badge variant="outline" className="border-red-500/30 text-red-600 dark:text-red-400">FAILED</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

export default function DashboardLogsPage() {
  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            System Logs
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Pantau aktivitas sistem dan riwayat sinkronisasi data secara detail.
          </p>
        </div>
      </div>

      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
              <TableRow className="hover:bg-transparent border-0 border-b border-gray-100 dark:border-gray-800">
                <TableHead className="w-[180px] pl-6 h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">Waktu & ID</TableHead>
                <TableHead className="w-[200px] h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">User & Device</TableHead>
                <TableHead className="w-[150px] h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">Aksi & Entitas</TableHead>
                <TableHead className="min-w-[300px] h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">Deskripsi Lengkap</TableHead>
                <TableHead className="w-[100px] text-center pr-6 h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyLogs.map((log) => {
                const Icon = log.icon;
                const formattedDate = new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(log.timestamp));

                return (
                  <TableRow key={log.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors border-0 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                    <TableCell className="pl-6 py-4 align-top">
                      <div className="flex flex-col space-y-1 mt-0.5">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formattedDate}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                          <Clock className="h-3 w-3" />
                          <span>{log.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 align-top">
                      <div className="flex flex-col space-y-1.5 mt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {log.user}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                            {log.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MonitorSmartphone className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[160px]">{log.device}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      <div className="flex flex-col items-start gap-1.5 mt-0.5">
                        {getActionBadge(log.action)}
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                          {log.entity}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 align-top whitespace-normal">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <p className="text-sm text-foreground/90 font-medium leading-relaxed max-w-lg">
                            {log.description}
                          </p>
                          <span className="text-[11px] font-mono font-medium text-muted-foreground/80 bg-gray-50/50 dark:bg-gray-900/50 px-2 py-0.5 rounded w-fit border border-gray-100/50 dark:border-gray-800/50">
                            IP: {log.ip}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="pr-6 py-4 align-top text-center">
                      <div className="flex justify-center mt-1">
                        {getStatusBadge(log.status)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
