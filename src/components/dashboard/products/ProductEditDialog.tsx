"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { ProductEditForm } from "./ProductEditForm";

interface ProductEditDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProductEditDialog({ product, open, onOpenChange, onSuccess }: ProductEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <DialogDescription>
            Ubah nama, deskripsi, brand, rasa, dan gambar produk.
          </DialogDescription>
        </DialogHeader>
        <ProductEditForm
          product={product}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
