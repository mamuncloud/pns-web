"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { api, Supplier } from "@/lib/api";
import { getProductsFromDb } from "@/lib/products-db";
import { useDebounce } from "@/hooks/use-debounce";
import { Product } from "@/types/product";

// Sub-components
import { ConsignmentHeader } from "./form-parts/ConsignmentHeader";
import { ConsignmentMetadata } from "./form-parts/ConsignmentMetadata";
import { ConsignmentItemList, ItemState } from "./form-parts/ConsignmentItemList";
import { ConsignmentSummary } from "./form-parts/ConsignmentSummary";
import { ConsignmentAttachments } from "./form-parts/ConsignmentAttachments";

interface ConsignmentFormProps {
  onSuccess: () => void;
}

export function ConsignmentForm({ onSuccess }: ConsignmentFormProps) {
  // --- State ---
  const [items, setItems] = useState<ItemState[]>([]);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supplierSearch, setSupplierSearch] = useState("");
  const debouncedSupplierSearch = useDebounce(supplierSearch, 500);
  
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch, 500);

  // --- Effects ---
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const suppliersRes = await api.suppliers.list(debouncedSupplierSearch);
        setSuppliers(suppliersRes.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    }
    fetchSuppliers();
  }, [debouncedSupplierSearch]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRes = await getProductsFromDb(1, 40, undefined, debouncedProductSearch);
        setProducts(productsRes.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, [debouncedProductSearch]);

  // --- Handlers ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await api.storage.uploadSingle(file);
      setAttachmentUrl(response.data);
      toast.success("Foto nota berhasil diunggah");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah foto nota");
    } finally {
      setIsUploading(false);
    }
  };

  const addItem = () => {
    setItems([{
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      productVariantId: "",
      productName: "",
      qtyReceived: 1,
      unitCost: 0,
      package: ""
    }, ...items]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ItemState>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if (updates.productVariantId) {
          for (const p of products) {
            const v = p.variants.find(v => v.id === updates.productVariantId);
            if (v) {
              updated.productId = p.id;
              updated.productName = p.name;
              updated.package = v.package;
              updated.unitCost = v.hpp || 0;
              break;
            }
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    if (!supplierId || items.length === 0) {
      toast.error("Mohon pilih supplier dan tambahkan setidaknya satu barang.");
      return;
    }

    const invalidItems = items.filter(item => !item.productVariantId || item.qtyReceived <= 0);
    if (invalidItems.length > 0) {
      toast.error("Mohon lengkapi semua baris barang dengan varian dan jumlah yang valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId,
        date: new Date(date).toISOString(),
        note: note || undefined,
        attachmentUrl: attachmentUrl || undefined,
        items: items.map(item => ({
          productVariantId: item.productVariantId,
          qtyReceived: item.qtyReceived,
          unitCost: Math.round(item.unitCost),
        }))
      };

      await api.consignment.create(payload);
      toast.success("Nota titipan berhasil disimpan.");
      
      // Reset form
      setItems([]);
      setSupplierId(null);
      setNote("");
      setAttachmentUrl(null);
      
      onSuccess();
    } catch (err) {
      console.error("Failed to submit consignment", err);
      const errorResponse = err as { response?: { message?: string } };
      const message = errorResponse.response?.message || "Gagal memproses protokol konsinyasi.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Derived Value ---
  const totalValue = items.reduce((acc, item) => acc + (item.qtyReceived * item.unitCost), 0);
  const totalQty = items.reduce((acc, item) => acc + item.qtyReceived, 0);
  
  const flatVariants = useMemo(() => 
    products.flatMap(p => 
      p.variants.map(v => ({
        ...v,
        productName: p.name,
        displayName: `${p.name} (${v.package})`,
        price: v.price
      }))
    ), [products]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050510] text-[#1E293B] dark:text-[#F8FAFC] font-sans p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <ConsignmentHeader 
          date={date} 
          hasSupplier={!!supplierId} 
          itemCount={items.length} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
          <div className="lg:col-span-8 space-y-8">
            <ConsignmentMetadata 
              date={date}
              setDate={setDate}
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              search={supplierSearch}
              onSearchChange={setSupplierSearch}
            />

            <ConsignmentItemList 
              items={items}
              onAdd={addItem}
              onRemove={removeItem}
              onUpdate={updateItem}
              flatVariants={flatVariants}
              search={productSearch}
              onSearchChange={setProductSearch}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-10 space-y-6">
              <ConsignmentSummary 
                totalValue={totalValue}
                totalQty={totalQty}
                itemCount={items.length}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isValid={!!supplierId && items.length > 0}
              />

              <ConsignmentAttachments 
                attachmentUrl={attachmentUrl}
                onUpload={handleFileUpload}
                onRemove={() => setAttachmentUrl(null)}
                isUploading={isUploading}
                note={note}
                onNoteChange={setNote}
              />

              <div className="px-6 py-4 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[9px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">
                    Sistem audit stok otomatis aktif dalam sesi ini.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
