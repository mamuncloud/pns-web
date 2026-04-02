"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Save, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Employee } from "@/types/financial";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const staffSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["MANAGER", "CASHIER"]),
  phone: z.string().optional().or(z.literal("")),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormProps {
  employee?: Employee | null; 
  onSuccess: () => void;
  onCancel: () => void;
}

export function StaffForm({ employee, onSuccess, onCancel }: StaffFormProps) {
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "CASHIER",
      phone: "",
    },
  });

  useEffect(() => {
    if (isEditing && employee) {
      reset({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        phone: employee.phone || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        role: "CASHIER",
        phone: "",
      });
    }
  }, [employee, isEditing, reset]);

  const onSubmit = async (data: StaffFormValues) => {
    try {
      if (isEditing && employee) {
        await api.employees.update(employee.id, data);
        toast.success("Data pegawai berhasil diperbarui");
      } else {
        await api.employees.create(data);
        toast.success("Pegawai baru berhasil ditambahkan dan email undangan telah dikirim");
      }
      onSuccess();
      if (!isEditing) {
        reset({ name: "", email: "", role: "CASHIER", phone: "" });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data";
      toast.error(message);
    }
  };

  return (
    <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-tight italic bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {isEditing ? "Edit Pegawai" : "Tambah Pegawai"}
          </CardTitle>
          {isEditing && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-all">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs font-medium italic">
          {isEditing 
            ? "Ubah detail informasi pegawai. Perubahan email akan dicek agar tidak duplikat." 
            : "Masukkan detail pegawai baru. Sistem otomatis akan mengirimkan email undangan."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Cth: Budi Santoso"
                {...register("name")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Alamat Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Cth: budi@planetnyemil.com"
                {...register("email")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Nomor WhatsApp (Opsional)</Label>
              <Input
                id="phone"
                placeholder="Cth: 08123456789"
                {...register("phone")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.phone && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Role / Hak Akses</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(
                      "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium text-left uppercase text-xs tracking-widest font-black",
                      errors.role && "border-red-500"
                    )}>
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-950/90">
                      <SelectItem value="CASHIER" className="rounded-xl py-3 px-4 font-black text-[10px] uppercase tracking-widest">Cashier (Kasir)</SelectItem>
                      <SelectItem value="MANAGER" className="rounded-xl py-3 px-4 font-black text-[10px] uppercase tracking-widest">Manager (Admin)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.role.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
             <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 group relative overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[11px] italic transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isEditing ? (
                    <><Save className="h-5 w-5 transition-transform group-hover:scale-110" /> Simpan Perubahan</>
                  ) : (
                    <><UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" /> Daftarkan Pegawai</>
                  )}
                </div>
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  Batalkan Edit
                </Button>
              )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
