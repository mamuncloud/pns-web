"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { api, Supplier } from "@/lib/api";
import { SupplierForm } from "@/components/dashboard/suppliers/SupplierForm";
import { SupplierList } from "@/components/dashboard/suppliers/SupplierList";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";

export default function DashboardSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.suppliers.list();
      setSuppliers(data);
    } catch {
      toast.error("Gagal memuat data supplier");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await api.suppliers.delete(supplierToDelete.id);
      toast.success("Supplier berhasil dihapus");
      setSupplierToDelete(null);
      fetchSuppliers();
      if (selectedSupplier?.id === supplierToDelete.id) {
        setSelectedSupplier(null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus supplier";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Manajemen Supplier</h2>
          <p className="text-sm text-muted-foreground font-medium">Kelola data supplier untuk pembelian dan konsinyasi.</p>
        </div>
        {!selectedSupplier && (
          <Button
            onClick={() => {
              const el = document.getElementById("supplier-form-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="md:hidden group relative h-12 px-6 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px] italic transition-all duration-500 border border-white/10"
          >
            <Truck className="h-4 w-4 mr-2" /> Tambah Supplier
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SupplierList
            suppliers={suppliers}
            isLoading={isLoading}
            onEdit={(supplier) => {
              setSelectedSupplier(supplier);
              const el = document.getElementById("supplier-form-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            onDelete={setSupplierToDelete}
          />
        </div>

        <div className="lg:col-span-1" id="supplier-form-section">
          <div className="sticky top-8 space-y-6">
            <SupplierForm
              supplier={selectedSupplier}
              onSuccess={() => {
                fetchSuppliers();
                setSelectedSupplier(null);
              }}
              onCancel={() => setSelectedSupplier(null)}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={!!supplierToDelete}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}
        title="Hapus Supplier"
        description={`Apakah Anda yakin ingin menghapus data supplier ${supplierToDelete?.name}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </div>
  );
}
