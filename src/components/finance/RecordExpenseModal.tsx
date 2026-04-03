"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Receipt, ReceiptText, RefreshCw, Wallet, Tag } from "lucide-react";
import { ExpenseCategory } from "@/types/financial";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  receiptUrl: z.string().optional().or(z.literal("")),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface RecordExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RecordExpenseModal({ open, onOpenChange, onSuccess }: RecordExpenseModalProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      amount: 0,
      categoryId: "",
      description: "",
      receiptUrl: "",
    },
  });

  const categoryId = watch("categoryId");

  useEffect(() => {
    if (open) {
      fetchCategories();
      reset();
    }
  }, [open, reset]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.expenses.categories();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Could not load expense categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await api.expenses.create({
        amount: data.amount,
        categoryId: data.categoryId,
        description: data.description,
        receiptUrl: data.receiptUrl || undefined,
      });
      toast.success("Expense recorded successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to record expense:", error);
      toast.error("Failed to save expense record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-blue-600/5 p-6 border-b border-blue-600/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-600 transition-colors">
                <ReceiptText className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Record Expense</DialogTitle>
                <DialogDescription className="text-xs font-semibold uppercase text-muted-foreground/60 tracking-widest">Financial Outflow</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-white">
          <div className="space-y-4">
            <div className="space-y-2 group">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider group-focus-within:text-blue-600 transition-colors">
                  Expense Category
                </Label>
                <button 
                  type="button" 
                  onClick={fetchCategories}
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={cn("w-3 h-3", loadingCategories && "animate-spin")} />
                  Refresh
                </button>
              </div>
              <Select 
                onValueChange={(value) => setValue("categoryId", value || "")}
                value={categoryId || ""}
              >
                <SelectTrigger className={cn(
                  "h-12 bg-muted/30 border-2 rounded-2xl focus:ring-blue-600 focus:border-blue-600 transition-all font-bold",
                  errors.categoryId && "border-red-500"
                )}>
                  <SelectValue placeholder={loadingCategories ? "Fetching categories..." : "Choose Category"} />
                </SelectTrigger>
                <SelectContent className="bg-white border rounded-xl shadow-2xl p-1 max-h-[250px]">
                  {categories.length === 0 && !loadingCategories ? (
                    <div className="p-4 text-center text-xs text-muted-foreground font-semibold italic">
                      No categories found. Click refresh!
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 rounded-lg py-2 transition-colors font-bold text-xs uppercase tracking-tight">
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-wider group-focus-within:text-blue-600 transition-colors">Amount (IDR)</Label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-600 transition-all" />
                <Input 
                  type="number" 
                  placeholder="0" 
                  className={cn(
                    "pl-12 h-12 bg-muted/30 border-2 rounded-2xl focus-visible:ring-blue-600 focus-visible:border-blue-600 font-black text-lg transition-all",
                    errors.amount && "border-red-500"
                  )}
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-wider group-focus-within:text-blue-600 transition-colors">Description / Purpose</Label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-600 transition-all" />
                <Input 
                  placeholder="e.g. Pembelian alat tulis kantor" 
                  className={cn(
                    "pl-12 h-12 bg-muted/30 border-2 rounded-2xl focus-visible:ring-blue-600 focus-visible:border-blue-600 font-medium transition-all",
                    errors.description && "border-red-500"
                  )}
                  {...register("description")}
                />
              </div>
              {errors.description && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-wider flex items-center gap-1.5 group-focus-within:text-blue-600 transition-colors">
                Receipt Attachment <span className="opacity-40 italic font-medium tracking-normal">(External Link)</span>
              </Label>
              <div className="relative">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-600 transition-all" />
                <Input 
                  placeholder="https://imgur.com/your-receipt" 
                  className={cn(
                    "pl-12 h-12 bg-muted/30 border-2 rounded-2xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all",
                    errors.receiptUrl && "border-red-500"
                  )}
                  {...register("receiptUrl")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-blue-600/10 px-0 bg-transparent">
            <div className="flex w-full gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] hover:bg-muted active:scale-[0.98] transition-all"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  "Finalize Expense"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
