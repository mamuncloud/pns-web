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
          <Button className="h-14 px-8 flex items-center gap-3 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            <Package className="h-5 w-5" />
            Tambah Produk Baru
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
