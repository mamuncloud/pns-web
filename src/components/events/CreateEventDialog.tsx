"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CreateEventDialogProps {
  onSuccess: () => void;
}

export function CreateEventDialog({ onSuccess }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Exhibition",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.events.create(formData);
      toast.success("Event berhasil dibuat!");
      setOpen(false);
      setFormData({ name: "", type: "Exhibition", description: "" });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95" />
        }
      >
        <Plus className="mr-2 h-5 w-5" />
        Buat Event Baru
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Buat Event Baru</DialogTitle>
            <DialogDescription>
              Isi data detail event untuk mulai mengalokasikan stok khusus.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nama Event
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Pameran UMKM Jakarta 2024"
                className="rounded-xl border-gray-200 focus:ring-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tipe Event
              </Label>
              <Input
                id="type"
                placeholder="Contoh: Exhibition, Bazar, Donation"
                className="rounded-xl border-gray-200 focus:ring-primary"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Keterangan (Opsional)
              </Label>
              <Textarea
                id="description"
                placeholder="Detail tambahan mengenai event ini..."
                className="rounded-xl border-gray-200 focus:ring-primary min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl font-bold py-6 group"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Simpan & Lanjutkan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
