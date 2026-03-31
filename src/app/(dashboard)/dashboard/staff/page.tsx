"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus
} from "lucide-react";
import { api } from "@/lib/api";
import { Employee } from "@/types/financial";
import { StaffForm } from "@/components/dashboard/staff/StaffForm";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import { cn } from "@/lib/utils";

export default function DashboardStaffPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selection/Edition state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.employees.list();
      setEmployees(data);
    } catch {
      toast.error("Gagal memuat data pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await api.employees.delete(employeeToDelete.id);
      toast.success("Pegawai berhasil dihapus");
      setEmployeeToDelete(null);
      fetchEmployees();
      if (selectedEmployee?.id === employeeToDelete.id) {
        setSelectedEmployee(null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pegawai";
      toast.error(message);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Manajemen Pegawai</h2>
          <p className="text-sm text-muted-foreground font-medium">Kelola akses, role, dan data staf Planet Nyemil Snack.</p>
        </div>
        {!selectedEmployee && (
           <Button 
            onClick={() => {
              const el = document.getElementById('staff-form-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="md:hidden group relative h-12 px-6 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px] italic transition-all duration-500 border border-white/10"
           >
             <UserPlus className="h-4 w-4 mr-2" /> Tambah Pegawai
           </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Staff List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Cari nama atau email..." 
                className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Nama & Email</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-center">Role Akses</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Tanggal Bergabung</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-32 text-center animate-pulse">
                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/30">Memuat data pegawai...</p>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-32 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Pegawai tidak ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const isManager = employee.role === "MANAGER";
                      const isSelected = selectedEmployee?.id === employee.id;
                      return (
                        <tr key={employee.id} className={cn(
                          "hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all duration-300 group",
                          isSelected && "bg-primary/[0.05] dark:bg-primary/10 border-l-4 border-l-primary"
                        )}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4 group/item">
                              <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-500",
                                isSelected ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary" : "bg-primary/10 text-primary border-primary/20"
                              )}>
                                <span className="text-lg font-black capitalize">{employee.name.charAt(0)}</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-base font-black text-foreground tracking-tight">{employee.name}</p>
                                <p className="text-sm text-muted-foreground italic font-medium">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <Badge variant="outline" className={cn(
                              "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-xl border-2",
                              isManager ? "border-amber-500/20 text-amber-600 bg-amber-50 dark:bg-amber-950/30" : "border-slate-500/20 text-slate-600 bg-slate-50 dark:bg-slate-900/30"
                            )}>
                              {employee.role}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <p className="text-sm text-muted-foreground font-medium">
                              {format(new Date(employee.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-right">
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
                                  onClick={() => setSelectedEmployee(employee)}
                                >
                                  <Edit2 className="h-4 w-4 mr-2 text-primary" /> Edit Pegawai
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  className="rounded-xl py-3 px-4 font-black text-[10px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 dark:hover:bg-red-950/50 dark:focus:bg-red-950/50 transition-colors"
                                  onClick={() => setEmployeeToDelete(employee)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Hapus Pegawai
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-1" id="staff-form-section">
          <div className="sticky top-8 space-y-6">
            <StaffForm 
              employee={selectedEmployee}
              onSuccess={() => {
                fetchEmployees();
                setSelectedEmployee(null); // Reset after success/edit
              }}
              onCancel={() => setSelectedEmployee(null)}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        title="Hapus Pegawai"
        description={`Apakah Anda yakin ingin menghapus data pegawai ${employeeToDelete?.name}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
