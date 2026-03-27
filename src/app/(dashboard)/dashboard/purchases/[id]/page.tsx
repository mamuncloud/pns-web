"use client";

import { useEffect, useState, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { api, Supplier } from "@/lib/api";
import { Product } from "@/types/product";
import { Purchase } from "@/types/financial";
import { getProductsFromDb } from "@/lib/products-db";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  User, 
  Package, 
  Receipt,
  FileText,
  TrendingUp,
  TrendingDown,
  Tag,
  Check,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  X,
  Calculator,
  ArrowRight,
  ShoppingBag,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent, 
  ComboboxItem, 
  ComboboxEmpty,
  ComboboxList
} from "@/components/ui/combobox";

interface EditableItem {
  id: string;
  purchaseItemId?: string;
  productId: string;
  variantLabel: string;
  productName: string;
  brandName: string;
  qty: number;
  totalCost: number;
  extraCosts: number;
  unitCost: number;
  lastCost: number;
  priceChange: number;
  sellingPrice: number;
  marginPct: number;
  marginAmount: number;
  avgCostPreview: number;
  expiredDate: string;
}

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isInternalReload = useRef(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [editSupplier, setEditSupplier] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editStatus, setEditStatus] = useState<'DRAFT' | 'COMPLETED'>('DRAFT');
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ 
    title: "", 
    description: "", 
    onConfirm: () => {} 
  });

  const fetchPurchase = useCallback(async () => {
    try {
      const response = await api.purchases.get(id);
      if (response.success) {
        setPurchase(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch purchase details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPurchase();
  }, [id, fetchPurchase]);

  // Prevent accidental page reload if there are unsaved items or submission is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isInternalReload.current) return;
      // If we are editing a draft and have items, or if we are currently saving/confirming
      if (actionLoading || (isEditing && editItems.length > 0)) {
        e.preventDefault();
        e.returnValue = ""; 
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [actionLoading, isEditing, editItems.length]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await getProductsFromDb(1, 100);
      setProducts(data);
    }
    async function fetchSuppliers() {
      try {
        const { data } = await api.suppliers.list();
        setSuppliers(data);
      } catch (error) {
        console.error("Failed to fetch suppliers", error);
      }
    }
    fetchProducts();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (purchase && isEditing) {
      setEditSupplier(purchase.supplierId);
      setEditDate(purchase.date.split('T')[0]);
      setEditNote(purchase.note || "");
      setEditStatus(purchase.status);
      setEditItems(
        purchase.items?.map(item => ({
          id: item.id,
          purchaseItemId: item.id,
          productId: item.productId,
          variantLabel: item.variantLabel,
          productName: item.product?.name || "",
          brandName: item.product?.brand?.name || "",
          qty: item.qty,
          totalCost: item.totalCost,
          extraCosts: item.extraCosts,
          unitCost: item.unitCost,
          lastCost: item.unitCost,
          priceChange: 0,
          sellingPrice: item.sellingPrice,
          marginPct: Math.round(item.unitCost > 0 ? ((item.sellingPrice - item.unitCost) / item.unitCost) * 100 : 0),
          marginAmount: item.sellingPrice - item.unitCost,
          avgCostPreview: item.unitCost,
          expiredDate: item.expiredDate?.split('T')[0] || ""
        })) || []
      );
    }
  }, [purchase, isEditing]);

  const updateEditItem = (itemId: string, updates: Partial<EditableItem>) => {
    setEditItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (updates.productId) {
          const product = products.find(p => p.id === updates.productId);
          updated.productName = product?.name || "";
          updated.brandName = product?.brand?.name || "";
          const defaultVariant = product?.variants?.[0];
          updated.variantLabel = defaultVariant?.package || "bal";
          updated.lastCost = product?.currentHpp || (product?.variants?.[0]?.price || 0) * 0.7;
          updated.sellingPrice = product?.sellingPrice || product?.variants?.[0]?.price || 0;
        }

        const currentProduct = products.find(p => p.id === updated.productId);

        if (updates.qty !== undefined || updates.totalCost !== undefined || updates.extraCosts !== undefined || updates.sellingPrice !== undefined) {
          if (updated.qty > 0) {
            updated.unitCost = (updated.totalCost + updated.extraCosts) / updated.qty;
            
            if (updated.lastCost > 0) {
              updated.priceChange = ((updated.unitCost - updated.lastCost) / updated.lastCost) * 100;
            }
            if (updated.sellingPrice > 0) {
              updated.marginAmount = updated.sellingPrice - updated.unitCost;
              updated.marginPct = updated.unitCost > 0 ? (updated.marginAmount / updated.unitCost) * 100 : 0;
            }

            const currentStock = currentProduct?.stockQty || 0;
            const totalNewQty = currentStock + updated.qty;
            if (totalNewQty > 0) {
              updated.avgCostPreview = (currentStock * updated.lastCost + updated.qty * updated.unitCost) / totalNewQty;
            }
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const addEditItem = () => {
    setEditItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      productId: "",
      variantLabel: "bal",
      productName: "",
      brandName: "",
      qty: 1,
      totalCost: 0,
      extraCosts: 0,
      unitCost: 0,
      lastCost: 0,
      priceChange: 0,
      sellingPrice: 0,
      marginPct: 0,
      marginAmount: 0,
      avgCostPreview: 0,
      expiredDate: ""
    }]);
  };

  const removeEditItem = (itemId: string) => {
    setEditItems(prev => prev.filter(item => item.id !== itemId));
  };

  const confirmPurchaseAction = async () => {
    setActionLoading(true);
    try {
      const response = await api.purchases.update(id, { status: 'COMPLETED' });
      if (response.success) {
        setPurchase(response.data);
        setIsEditing(false);
        toast.success("Pembelian berhasil dikonfirmasi!");
        // Reload to refresh everything properly
        isInternalReload.current = true;
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Failed to confirm purchase:", error);
      toast.error("Gagal mengonfirmasi pembelian.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = () => {
    setConfirmConfig({
      title: "Konfirmasi Pembelian",
      description: "Stok akan ditambahkan ke inventori. Lanjutkan?",
      onConfirm: confirmPurchaseAction
    });
    setIsConfirmOpen(true);
  };

  const saveChangesAction = async () => {
    setActionLoading(true);
    try {
      const response = await api.purchases.update(id, {
        supplierId: editSupplier,
        date: new Date(editDate).toISOString(),
        note: editNote,
        status: editStatus,
        items: editItems.map(item => ({
          productId: item.productId,
          variantLabel: item.variantLabel,
          qty: item.qty,
          totalCost: item.totalCost,
          extraCosts: item.extraCosts,
          sellingPrice: item.sellingPrice,
          expiredDate: item.expiredDate ? new Date(item.expiredDate).toISOString() : undefined
        }))
      });
      if (response.success) {
        setPurchase(response.data);
        setIsEditing(false);
        toast.success("Perubahan berhasil disimpan!");
        isInternalReload.current = true;
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveChanges = () => {
    if (editItems.length === 0 || !editSupplier) {
      toast.error("Minimal harus ada 1 item dan supplier harus dipilih.");
      return;
    }

    setConfirmConfig({
      title: "Simpan Perubahan",
      description: "Simpan perubahan pada draft ini?",
      onConfirm: saveChangesAction
    });
    setIsConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-950 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Memuat Detail Pembelian...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-950 gap-6">
        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
          <FileText className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Purchase Not Found</h2>
          <p className="text-muted-foreground text-sm">The purchase record you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/purchases")} variant="outline" className="rounded-xl px-8 font-bold">
          Back to History
        </Button>
      </div>
    );
  }

  const formatCurrency = (amt: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amt);

  const totalEditAmount = editItems.reduce((acc, item) => acc + item.totalCost + item.extraCosts, 0);

  if (isEditing && purchase.status === 'DRAFT') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Button 
              onClick={() => setIsEditing(false)} 
              variant="ghost" 
              className="group -ml-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg pl-2 pr-4 font-black text-[10px] uppercase tracking-widest"
            >
              <X className="h-3.5 w-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Batal Edit
            </Button>
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">Edit Pembelian</h2>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                ID: <span className="font-black text-xs text-foreground/70 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded leading-none">{purchase.id.split('-').pop()}</span>
              </p>
            </div>
          </div>
          <Card className="border-none bg-primary/5 dark:bg-primary/950/20 p-6 flex flex-col items-end gap-1 rounded-3xl backdrop-blur-sm">
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Total Pembelian</span>
            <span className="text-3xl font-black text-primary tracking-tighter">
              {formatCurrency(totalEditAmount)}
            </span>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                      <User className="h-3 w-3 text-primary" /> Supplier
                    </label>
                    <Combobox value={editSupplier} onValueChange={(val) => setEditSupplier(val ?? "")}>
                      <ComboboxTrigger className="h-12 font-bold px-4 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-primary/20 transition-all rounded-xl shadow-none text-left">
                        {editSupplier ? (suppliers.find(s => s.id === editSupplier)?.name || editSupplier) : "Pilih supplier..."}
                      </ComboboxTrigger>
                      <ComboboxContent align="start" className="w-(--anchor-width) min-w-[280px] p-2 rounded-xl border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-gray-950/90">
                        <ComboboxInput placeholder="Cari supplier..." className="h-10 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 border-none focus:ring-0" />
                        <ComboboxList className="max-h-[300px] overflow-y-auto space-y-1">
                          {suppliers.map((s) => (
                            <ComboboxItem key={s.id} value={s.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 cursor-pointer group/item transition-colors">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm group-hover/item:text-primary transition-colors">{s.name}</span>
                                {s.contactName && <span className="text-[10px] text-muted-foreground">{s.contactName}</span>}
                              </div>
                              <Check className="h-4 w-4 text-primary opacity-0 group-data-[selected]:opacity-100 transition-opacity" />
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                      <Calendar className="h-3 w-3 text-primary" /> Tanggal Pembelian
                    </label>
                    <Input 
                      type="date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="h-12 font-bold px-4 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-primary/20 transition-all rounded-xl"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                      Keterangan (Optional)
                    </label>
                    <Input 
                      placeholder="Contoh: Pembelian stok bulanan, diskon supplier, dll."
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="h-12 font-bold px-4 bg-gray-50/50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus:ring-primary/20 transition-all rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Daftar Barang</h3>
                <Button type="button" onClick={addEditItem} size="sm" className="h-8 font-bold gap-1 px-3">
                  <Plus className="h-3.5 w-3.5" /> Tambah Item
                </Button>
              </div>

              {editItems.length === 0 ? (
                <Card className="border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                  <CardContent className="p-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">Belum ada barang yang ditambahkan.</p>
                    <Button type="button" onClick={addEditItem} variant="link" className="text-primary font-bold mt-2">
                      Klik untuk tambah item pertama
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {editItems.map((item, idx) => (
                    <Card key={item.id} className="border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group bg-white/90 dark:bg-gray-950/50 backdrop-blur-sm">
                      <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                          <div className="p-5 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-primary/20">
                                {idx + 1}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Pilih Produk</span>
                                <span className="text-xs font-bold text-muted-foreground truncate max-w-[200px]">
                                  {item.productName || "Belum dipilih"}
                                </span>
                              </div>
                            </div>

                            <div className="flex-1 max-w-md">
                              <Combobox value={item.productId || ""} onValueChange={(val) => updateEditItem(item.id, { productId: val ?? "" })}>
                                <ComboboxTrigger className="h-12 font-bold bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl px-4 shadow-sm hover:border-primary/30 transition-all text-left">
                                  {item.productId ? (
                                    <div className="flex flex-col items-start truncate">
                                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter leading-none mb-0.5">
                                        {item.brandName || "Tanpa Brand"}
                                      </span>
                                      <span className="text-sm truncate w-full">{item.productName}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Cari barang...</span>
                                  )}
                                </ComboboxTrigger>
                                <ComboboxContent align="start" className="w-(--anchor-width) min-w-[320px] p-2 rounded-xl border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-gray-950/90">
                                  <ComboboxInput placeholder="Cari barang atau brand..." className="h-10 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 border-none focus:ring-0" />
                                  <ComboboxEmpty className="py-10 text-xs font-bold text-muted-foreground uppercase tracking-widest">Barang tidak ditemukan.</ComboboxEmpty>
                                  <ComboboxList className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                    {products.map(p => (
                                      <ComboboxItem key={p.id} value={p.id} className="rounded-lg py-3 px-3 font-bold cursor-pointer hover:bg-primary/5">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">{p.brand?.name || "Tanpa Brand"}</span>
                                          <span className="text-sm">{p.name}</span>
                                          <span className="text-[10px] text-muted-foreground/70 font-black uppercase tracking-wider">
                                            Stock: {p.stockQty || 0} • Rp {(p.sellingPrice || 0).toLocaleString('id-ID')}
                                          </span>
                                        </div>
                                      </ComboboxItem>
                                    ))}
                                  </ComboboxList>
                                </ComboboxContent>
                              </Combobox>
                            </div>

                            <button type="button" onClick={() => removeEditItem(item.id)} className="p-2 text-muted-foreground/30 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="p-6 flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[100px] space-y-2">
                              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Label</label>
                              <select 
                                value={item.variantLabel || "bal"}
                                onChange={(e) => updateEditItem(item.id, { variantLabel: e.target.value })}
                                className="w-full h-11 font-black text-sm bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="bal">BAL (Default)</option>
                                <option value="ES3">ES3</option>
                                <option value="ES4">ES4</option>
                                <option value="250gr">250gr</option>
                                <option value="500gr">500gr</option>
                                <option value="1kg">1kg</option>
                              </select>
                            </div>
                            
                            <div className="w-24 space-y-2">
                              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Qty</label>
                              <Input 
                                type="number" 
                                min="1" 
                                value={item.qty || ""}
                                onChange={(e) => updateEditItem(item.id, { qty: Number(e.target.value) })}
                                className="h-11 font-black text-lg bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl px-4"
                                required
                              />
                            </div>
                            
                            <div className="flex-1 min-w-[150px] space-y-2">
                              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Total Dari Supplier</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">Rp</span>
                                <Input 
                                  type="number" 
                                  min="0"
                                  value={item.totalCost || ""}
                                  onChange={(e) => updateEditItem(item.id, { totalCost: Number(e.target.value) })}
                                  className="h-11 font-black text-lg bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl pl-9"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex-1 min-w-[120px] space-y-2">
                              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">Biaya Ekstra</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">Rp</span>
                                <Input 
                                  type="number" 
                                  min="0"
                                  value={item.extraCosts || ""}
                                  onChange={(e) => updateEditItem(item.id, { extraCosts: Number(e.target.value) })}
                                  className="h-11 font-black text-lg bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl pl-9"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div className="flex-1 min-w-[150px] space-y-2">
                              <label className="text-[11px] font-black uppercase text-primary tracking-wider px-1">Harga Jual Baru</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-primary/50">Rp</span>
                                <Input 
                                  type="number" 
                                  min="0"
                                  value={item.sellingPrice || ""}
                                  onChange={(e) => updateEditItem(item.id, { sellingPrice: Number(e.target.value) })}
                                  className="h-11 font-black text-lg bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 text-primary rounded-xl pl-9 focus:ring-primary/20"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50/30 dark:bg-gray-900/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div className="space-y-1.5 px-2">
                              <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3 text-orange-500" /> Kadaluwarsa
                              </label>
                              <Input 
                                type="date" 
                                value={item.expiredDate || ""}
                                onChange={(e) => updateEditItem(item.id, { expiredDate: e.target.value })}
                                className="h-9 font-bold bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl"
                              />
                            </div>

                            <div className="bg-white/50 dark:bg-gray-950/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">HPP Item Ini</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-black text-foreground">Rp {Math.round(item.unitCost).toLocaleString('id-ID')}</span>
                                {item.priceChange !== 0 && (
                                  <span className={cn("text-[10px] font-black flex items-center gap-0.5", 
                                    item.priceChange > 0 ? "text-red-500" : "text-green-500")}>
                                    {item.priceChange > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                    {Math.abs(item.priceChange).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col items-center text-center">
                              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Margin Kotor</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">{Math.round(item.marginPct)}%</span>
                                <span className="text-[10px] font-bold text-emerald-600/70">Rp {(item.marginAmount).toLocaleString('id-ID')}</span>
                              </div>
                            </div>

                            <div className="bg-blue-500/5 dark:bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 shadow-sm flex flex-col items-center text-center">
                              <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <ArrowRight className="h-2.5 w-2.5 text-blue-500" /> Estimasi HPP Baru
                              </span>
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-blue-700 dark:text-blue-300">
                                  Rp {Math.round(item.avgCostPreview).toLocaleString('id-ID')}
                                </span>
                                <span className="text-[8px] font-bold text-blue-600/50 uppercase tracking-tighter">Preview hpp gudang</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit space-y-6">
            <Card className="border-none bg-primary/5 dark:bg-primary/900/10 backdrop-blur-xl shadow-2xl shadow-primary/10 rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                  <Calculator className="h-4 w-4" />
                  Purchase Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8 pt-0">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Pembelian</p>
                  <p className="text-4xl font-black text-foreground tracking-tighter">
                    <span className="text-lg mr-1 text-primary">Rp</span>
                    {totalEditAmount.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dampak ke HPP & Margin</h4>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  {editItems.filter(i => i.productId).length === 0 ? (
                    <div className="py-8 text-center bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-primary/10">
                      <p className="text-xs text-muted-foreground italic font-medium px-4 leading-relaxed">Masukkan item untuk melihat analisis dampak harga...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editItems.filter(i => i.productId).map(item => (
                        <div key={item.id} className="group/item space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-foreground/80 truncate max-w-[140px] uppercase tracking-tighter">{item.productName}</span>
                            <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded italic">HPP PREVIEW</span>
                          </div>
                          <div className="p-3 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-primary/5 group-hover/item:border-primary/20 transition-all flex items-center justify-between shadow-sm">
                            <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">HPP Baru (Est)</p>
                              <p className="text-sm font-black text-foreground">Rp {Math.round((item.lastCost + item.unitCost) / 2).toLocaleString('id-ID')}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover/item:translate-x-1 transition-transform" />
                            <div className="text-right">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">Impact</p>
                              <p className={cn("text-[10px] font-black px-2 py-0.5 rounded-full inline-block", item.priceChange > 0 ? "bg-red-50 text-red-600 dark:bg-red-950/30" : "bg-green-50 text-green-600 dark:bg-green-950/30")}>
                                {item.priceChange > 0 ? "Margin ↓" : "Margin ↑"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSaveChanges}
                  disabled={actionLoading}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all bg-primary text-primary-foreground"
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 space-y-3 shadow-lg shadow-amber-900/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Tips Edit
              </p>
              <p className="text-[11px] leading-relaxed font-bold opacity-80 uppercase tracking-tight"> Perubahan hanya berlaku untuk purchase dengan status DRAFT. Purchase yang sudah di-CONFIRM tidak dapat diedit.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Button 
            onClick={() => router.push("/dashboard/purchases")} 
            variant="ghost" 
            className="group -ml-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg pl-2 pr-4 font-black text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Detail Pembelian</h2>
              <Badge 
                variant="outline"
                className={cn(
                  "font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-xl border-2 transition-all shadow-sm",
                  purchase.status === 'COMPLETED' 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5" 
                    : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-indigo-500/5"
                )}
              >
                {purchase.status === 'COMPLETED' ? 'CONFIRMED' : 'DRAFT'}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              ID: <span className="font-black text-xs text-foreground/70 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded leading-none">{purchase.id.split('-').pop()}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 mx-1" />
              Dibuat pada {format(new Date(purchase.createdAt), "dd MMMM yyyy, HH:mm", { locale: localeId })} WIB
            </p>
          </div>
        </div>

        <Card className="border-none bg-primary/5 dark:bg-primary/950/20 p-6 flex flex-col items-end gap-1 rounded-3xl backdrop-blur-sm">
          <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Total Pembelian</span>
          <span className="text-3xl font-black text-primary tracking-tighter">
            {formatCurrency(purchase.totalAmount)}
          </span>
        </Card>
      </div>

      {purchase.status === 'DRAFT' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-3xl border border-amber-200 dark:border-amber-900/30 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-800 dark:text-amber-200">Purchase Ini Belum Dikonfirmasi</p>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400/70">Stok belum masuk ke inventori</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl font-bold border-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Purchase
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex-1 sm:flex-none rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Konfirmasi Purchase
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white/70 dark:bg-gray-950/50 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                Informasi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-primary shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Supplier</p>
                    <p className="text-sm font-black text-foreground">{purchase.supplier?.name || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-primary shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Tanggal Invoice</p>
                    <p className="text-sm font-black text-foreground">
                      {format(new Date(purchase.date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-primary shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Catatan</p>
                    <p className="text-sm font-bold text-muted-foreground italic leading-relaxed">
                      {purchase.note || "Tidak ada catatan."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 space-y-3 shadow-lg shadow-indigo-900/5 relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Receipt className="h-24 w-24" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="h-4 w-4" /> Summary Analitik
             </p>
             <div className="space-y-4 relative z-10 pt-2">
               <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                  <span className="text-[11px] font-bold opacity-70">Total Item</span>
                  <span className="text-xs font-black">{purchase.items?.length || 0} Produk</span>
               </div>
               <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                  <span className="text-[11px] font-bold opacity-70">Rata-rata Margin</span>
                  <span className="text-xs font-black">
                    {Math.round(
                      (purchase.items?.reduce((acc, item) => acc + ((item.sellingPrice - item.unitCost) / item.sellingPrice), 0) || 0) / 
                      (purchase.items?.length || 1) * 100
                    )}%
                  </span>
               </div>
               <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                  <span className="text-[11px] font-bold opacity-70">Biaya Ekstra</span>
                  <span className="text-xs font-black">
                    {formatCurrency(purchase.items?.reduce((acc, item) => acc + item.extraCosts, 0) || 0)}
                  </span>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">Unit Terbanyak</span>
                  <p className="text-xs font-black truncate max-w-full">
                    {purchase.items?.length ? purchase.items.reduce((prev, curr) => (prev.qty > curr.qty ? prev : curr)).product?.name : "N/A"}
                  </p>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white/60 dark:bg-gray-950/50 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 pt-6 px-8 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em]">
                <Package className="h-3.5 w-3.5 text-primary" />
                Daftar Barang yang Dibeli
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/30 dark:bg-gray-900/30">
                  <TableRow className="hover:bg-transparent border-b-0">
                    <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 py-4">Produk</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Qty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">HPP Satuan</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Harga Jual</TableHead>
                    <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items?.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-white dark:hover:bg-gray-900/50 transition-all duration-300 align-top">
                      <TableCell className="pl-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1.5">
                            {item.product?.brand?.name && (
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-md">
                                {item.product.brand.name}
                              </Badge>
                            )}
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                              Supplier: {purchase.supplier?.name}
                            </span>
                          </div>
                          
                          <span className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-4">
                            {item.product?.name}
                          </span>
                          
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">All Product Children (Variants)</span>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {item.product?.variants?.map((v, vIdx) => (
                                  <div 
                                    key={vIdx} 
                                    className={cn(
                                      "flex flex-col p-2 rounded-xl border transition-all",
                                      v.package === item.variantLabel
                                        ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-sm"
                                        : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100"
                                    )}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={cn("text-[10px] font-black uppercase tracking-tighter", v.package === item.variantLabel ? "text-primary" : "text-muted-foreground")}>
                                        {v.package}
                                      </span>
                                      {v.package === item.variantLabel && (
                                        <Badge className="h-3.5 px-1 text-[7px] font-black bg-primary text-white border-none">PURCHASED</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-baseline justify-between gap-2">
                                      <span className="text-[9px] font-bold text-muted-foreground/60">Stock:</span>
                                      <span className={cn("text-[11px] font-black", v.stock && v.stock < 10 ? "text-red-500" : "text-foreground")}>
                                        {v.stock || 0}
                                      </span>
                                    </div>
                                    <div className="flex items-baseline justify-between gap-1 mt-1 border-t border-gray-100 dark:border-gray-800 pt-1">
                                      <span className="text-[8px] font-bold text-muted-foreground/40">Price:</span>
                                      <span className="text-[9px] font-black text-foreground">Rp {v.price.toLocaleString('id-ID')}</span>
                                    </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          {item.expiredDate && (
                            <div className="mt-4 flex items-center gap-1.5 py-1.5 px-3 bg-red-50 dark:bg-red-950/30 rounded-xl w-fit border border-red-100 dark:border-red-900/20">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">
                                Expired: {format(new Date(item.expiredDate), "dd MMM yyyy", { locale: localeId })}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-base py-6">
                        <div className="flex flex-col items-end">
                          <span className="text-xl">{item.qty}</span>
                          <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-1 bg-primary/5 px-2 py-0.5 rounded-full">{item.variantLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-6">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-sm text-foreground">{formatCurrency(item.unitCost)}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">HPP per unit</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-6">
                        <div className="flex flex-col items-end">
                           <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(item.sellingPrice)}</span>
                           <span className={cn(
                             "text-[9px] font-black uppercase px-2 py-1 rounded-lg mt-2 shadow-sm",
                             ((item.sellingPrice - item.unitCost) / item.sellingPrice) >= 0.2 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-orange-50 text-orange-600 dark:bg-orange-950/30"
                           )}>
                             Margin: {Math.round(((item.sellingPrice - item.unitCost) / item.sellingPrice) * 100)}%
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 text-right py-6">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-foreground">
                            {formatCurrency(item.totalCost + item.extraCosts)}
                          </span>
                          {item.extraCosts > 0 && (
                            <div className="flex flex-col items-end mt-1">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Cost: {formatCurrency(item.totalCost)}</span>
                              <span className="text-[9px] font-bold text-primary/60 uppercase">Extra: {formatCurrency(item.extraCosts)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-8 bg-gray-50/30 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                     <Tag className="h-3 w-3 text-primary opacity-50" />
                     <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Metode Perhitungan</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground italic max-w-xs">HPP Item dihitung menggunakan Weighted Average berdasarkan total cost + extra costs.</p>
               </div>
               <div className="flex items-baseline gap-4">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(purchase.totalAmount)}</span>
               </div>
            </div>
          </Card>
        </div>
      </div>
    <ConfirmationDialog
      open={isConfirmOpen}
      onOpenChange={setIsConfirmOpen}
      title={confirmConfig.title}
      description={confirmConfig.description}
      onConfirm={confirmConfig.onConfirm}
      confirmText="Lanjutkan"
      cancelText="Batal"
    />
  </div>
);
}
