"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Package } from "lucide-react";
import { api, PackageType } from "@/lib/api";
import { toast } from "sonner";

const PACKAGE_OPTIONS: { value: PackageType; label: string }[] = [
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "250gr", label: "250gr" },
  { value: "500gr", label: "500gr" },
  { value: "1kg", label: "1kg" },
  { value: "bal", label: "Bal" },
];

const variantSchema = z.object({
  package: z.enum(["Small", "Medium", "250gr", "500gr", "1kg", "bal"], {
    message: "Pilih packaging varian",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Harga tidak boleh negatif",
  }),
  initialStock: z.string().optional(),
  sizeInGram: z.string().optional(),
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface VariantCreateDialogProps {
  productId: string;
  onSuccess: () => void;
}

export function VariantCreateDialog({ productId, onSuccess }: VariantCreateDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      package: "Small" as PackageType,
      price: "",
      initialStock: "",
      sizeInGram: "",
    },
  });

  const selectedPackage = getValues("package");
  const watchSizeInGram = useWatch({
    control,
    name: "sizeInGram",
  });
  const sizeInGramValue = Number(watchSizeInGram) || 0;

  const onSubmit = async (data: VariantFormValues) => {
    try {
      await api.products.createVariant(productId, {
        package: data.package,
        price: Number(data.price),
        initialStock: data.initialStock ? Number(data.initialStock) : 0,
        sizeInGram: data.sizeInGram ? Number(data.sizeInGram) : undefined,
      });

      toast.success("Varian berhasil ditambahkan");
      setOpen(false);
      reset();
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan varian";
      toast.error(message);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Variant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add Product Variant
            </DialogTitle>
            <DialogDescription>
              Add a new packaging variant to this product.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="package">Packaging</Label>
              <Select
                value={selectedPackage}
                onValueChange={(value) =>
                  setValue("package", value as PackageType)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select packaging..." />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.package && (
                <p className="text-xs text-red-500">{errors.package.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Selling Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="25000"
                {...register("price")}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialStock">Initial Stock</Label>
              <Input
                id="initialStock"
                type="number"
                placeholder="0"
                {...register("initialStock")}
              />
              {errors.initialStock && (
                <p className="text-xs text-red-500">
                  {errors.initialStock.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeInGram">Size ({sizeInGramValue >= 1000 ? "kg" : "grams"})</Label>
              <Input
                id="sizeInGram"
                type="number"
                placeholder="250"
                {...register("sizeInGram")}
              />
              {errors.sizeInGram && (
                <p className="text-xs text-red-500">
                  {errors.sizeInGram.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
