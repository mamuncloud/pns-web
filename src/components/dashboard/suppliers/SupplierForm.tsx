"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Save, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api, Supplier } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const supplierSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  contactName: z.string().optional(),
  email: z.string().email("Format email tidak valid").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const isEditing = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (isEditing && supplier) {
      reset({
        name: supplier.name,
        contactName: supplier.contactName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    } else {
      reset({
        name: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [supplier, isEditing, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      const payload = {
        ...data,
        contactName: data.contactName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };

      if (isEditing && supplier) {
        await api.suppliers.update(supplier.id, payload);
        toast.success("Data supplier berhasil diperbarui");
      } else {
        await api.suppliers.create(payload);
        toast.success("Supplier baru berhasil ditambahkan");
      }
      onSuccess();
      if (!isEditing) {
        reset({ name: "", contactName: "", email: "", phone: "", address: "" });
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
            {isEditing ? "Edit Supplier" : "Tambah Supplier"}
          </CardTitle>
          {isEditing && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-all">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs font-medium italic">
          {isEditing
            ? "Ubah detail informasi supplier."
            : "Masukkan detail supplier baru untuk keperluan pembelian dan konsinyasi."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Nama Supplier</Label>
              <Input
                id="name"
                placeholder="Cth: PT Snack Indonesia"
                {...register("name")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="contactName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Nama Kontak</Label>
              <Input
                id="contactName"
                placeholder="Cth: Budi Santoso"
                {...register("contactName")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.contactName && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.contactName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.contactName.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Cth: supplier@email.com"
                {...register("email")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Telepon</Label>
              <Input
                id="phone"
                placeholder="Cth: 081234567890"
                {...register("phone")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.phone && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors px-1">Alamat</Label>
              <Input
                id="address"
                placeholder="Cth: Jl. Contoh No. 123, Jakarta"
                {...register("address")}
                className={cn(
                  "h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all font-medium",
                  errors.address && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight px-1">{errors.address.message}</p>}
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
                  <><Truck className="h-5 w-5 transition-transform group-hover:scale-110" /> Daftarkan Supplier</>
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
