"use client";

import { Search, MoreVertical, Edit2, Trash2, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Supplier } from "@/lib/api";
import { useState, useMemo } from "react";

interface SupplierListProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierList({ suppliers, isLoading, onEdit, onDelete }: SupplierListProps) {
  const [search, setSearch] = useState("");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const term = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        (s.contactName?.toLowerCase().includes(term) ?? false) ||
        (s.email?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [suppliers, search]);

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Cari nama, kontak, atau email..."
          className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Nama Supplier</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Kontak</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Email</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Telepon</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50 dark:divide-gray-900">
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-8 py-32 text-center animate-pulse">
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/30">Memuat data supplier...</p>
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-8 py-32 text-center">
                    <Truck className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Supplier tidak ditemukan</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300 group">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-lg font-black capitalize">{supplier.name.charAt(0)}</span>
                        </div>
                        <p className="text-base font-black text-foreground tracking-tight">{supplier.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <p className="text-sm text-muted-foreground font-medium">{supplier.contactName || "-"}</p>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <p className="text-sm text-muted-foreground font-medium italic">{supplier.email || "-"}</p>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <p className="text-sm text-muted-foreground font-medium">{supplier.phone || "-"}</p>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-white dark:hover:bg-gray-900 shadow-sm transition-all">
                              <span className="sr-only">Buka menu</span>
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 z-50">
                          <DropdownMenuItem
                            className="rounded-xl py-3 px-4 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => onEdit(supplier)}
                          >
                            <Edit2 className="h-4 w-4 mr-2 text-primary" /> Edit Supplier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl py-3 px-4 font-black text-[10px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 dark:hover:bg-red-950/50 dark:focus:bg-red-950/50 transition-colors"
                            onClick={() => onDelete(supplier)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Hapus Supplier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
