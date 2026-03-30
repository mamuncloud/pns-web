"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { UserPlus, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Employee } from "@/types/financial";
import { cn } from "@/lib/utils";

const staffSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["MANAGER", "CASHIER"]),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffDialogProps {
  employee?: Employee; 
  onSuccess: () => void;
  trigger?: React.ReactElement;
}

export function StaffDialog({ employee, onSuccess, trigger }: StaffDialogProps) {
  const [open, setOpen] = useState(false);
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
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && employee) {
        reset({
          name: employee.name,
          email: employee.email,
          role: employee.role,
        });
      } else {
        reset({
          name: "",
          email: "",
          role: "CASHIER",
        });
      }
    }
  }, [open, employee, isEditing, reset]);

  const onSubmit = async (data: StaffFormValues) => {
    try {
      if (isEditing && employee) {
        await api.employees.update(employee.id, data);
        toast.success("Data pegawai berhasil diperbarui");
      } else {
        await api.employees.create(data);
        toast.success("Pegawai baru berhasil ditambahkan dan email undangan telah dikirim");
      }
      setOpen(false);
      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? trigger : (
            <Button className="group relative h-14 px-8 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[11px] italic transition-all duration-500 border border-white/10 hover:scale-[1.02] active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3">
                <UserPlus className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
                <span>Tambah Pegawai</span>
              </div>
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pegawai" : "Tambah Pegawai Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Ubah detail informasi pegawai. Perubahan email akan dicek agar tidak duplikat." 
              : "Masukkan detail pegawai baru. Sistem otomatis akan mengirimkan email undangan (Magic Link) kepadanya."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Cth: Budi Santoso"
                {...register("name")}
                className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Cth: budi@planetnyemil.com"
                {...register("email")}
                className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role / Akses</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(errors.role && "border-red-500")}>
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASHIER">Cashier (Kasir)</SelectItem>
                      <SelectItem value="MANAGER">Manager (Admin)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-xs text-red-500 font-medium">{errors.role.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <><Save className="h-4 w-4 mr-2" /> Simpan</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" /> Tambah</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
