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
import { Package } from "lucide-react";
import { ProductCreateForm } from "./ProductCreateForm";
import { useState } from "react";

export function ProductCreateDialog() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    window.location.reload(); 
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="group relative h-14 px-8 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[11px] italic transition-all duration-500 hover:shadow-[0_0_30px_rgba(198,40,40,0.5)] hover:scale-[1.02] active:scale-[0.98] border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative flex items-center gap-3 text-white">
              <div className="relative flex items-center justify-center">
                <Package className="h-5 w-5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
              <span className="relative">
                Tambah Produk Baru
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/30 transition-all duration-500 group-hover:w-full" />
              </span>
            </div>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail produk master baru di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProductCreateForm 
            onSuccess={handleSuccess} 
            onCancel={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
