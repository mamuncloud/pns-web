'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Scissors,
  AlertCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { api } from '@/lib/api';
import { getProductsFromDb } from '@/lib/products-db';
import { useDebounce } from "@/hooks/use-debounce";
import { Repack, CreateRepackDto } from '@/types/financial';
import { Product } from '@/types/product';
import Link from 'next/link';
import { formatWeight } from '@/lib/utils';

const VARIANT_LABELS = ['Medium', 'Small', '250gr', '500gr', '1kg', 'bal'] as const;
type VariantLabel = (typeof VARIANT_LABELS)[number];

interface OutputRow {
  id: string;
  targetVariantPackage: VariantLabel | '';
  qtyProduced: number;
  sellingPrice: number;
  sizeInGram: number;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function MarginBadge({ margin }: { margin: number }) {
  const isPositive = margin >= 0;
  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest px-2 py-1 rounded-md ${
        isPositive
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
          : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
      }`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{margin.toFixed(1)}%
    </div>
  );
}

function RepackRow({ repack }: { repack: Repack }) {
  const [open, setOpen] = useState(false);

  const outputSummary = repack.items
    .map((item) => {
      const label = item.targetVariant?.package || item.targetVariantPackage || 'Unknown';
      const size = item.sizeInGram ? ` (${formatWeight(item.sizeInGram)})` : '';
      return `${label}${size} ×${item.qtyProduced}`;
    })
    .join(', ');

  return (
    <>
      <TableRow 
        className="group cursor-pointer hover:bg-white/80 dark:hover:bg-gray-950/80 transition-colors border-b border-gray-100 dark:border-gray-800"
        onClick={() => setOpen(!open)}
      >
        <TableCell className="w-8">
          <button 
            type="button"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gray-50 dark:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:bg-primary/10 hover:text-primary transition-all h-8 w-8 shadow-sm"
          >
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </TableCell>
        <TableCell className="text-xs font-bold text-muted-foreground whitespace-nowrap">
          {formatDate(repack.createdAt)}
        </TableCell>
        <TableCell className="text-sm font-black text-foreground">
          <Link
            href={`/dashboard/products/${repack.productId}`}
            className="text-foreground hover:text-primary transition-colors tracking-tight"
            onClick={(e) => e.stopPropagation()}
          >
            {repack.product?.name ?? 'Produk Dihapus'}
          </Link>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-0">
            {repack.sourceVariant?.package ?? '—'} ×{repack.sourceQtyUsed}
          </Badge>
        </TableCell>
        <TableCell className="text-sm font-bold text-muted-foreground">{outputSummary}</TableCell>
        <TableCell className="text-xs text-muted-foreground/80 italic font-medium">
          {repack.note ?? <span className="opacity-50">—</span>}
        </TableCell>
      </TableRow>

      {open && (
        <TableRow className="bg-gray-50/30 dark:bg-gray-900/10 hover:bg-gray-50/30 border-0">
          <TableCell colSpan={6} className="pt-2 pb-6 pl-14 pr-6">
            <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-950 shadow-sm overflow-hidden mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Varian Output</th>
                    <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Gramasi</th>
                    <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Qty Diproduksi</th>
                    <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Harga Jual / unit</th>
                    <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Total Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                  {repack.items.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase">
                          {item.targetVariant?.package || item.targetVariantPackage || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-muted-foreground">
                        {formatWeight(item.sizeInGram)}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-foreground">{item.qtyProduced} pcs</td>
                      <td className="px-5 py-3 text-right font-medium text-muted-foreground">{formatIDR(item.sellingPrice)}</td>
                      <td className="px-5 py-3 text-right text-primary font-black">
                        {formatIDR(item.sellingPrice * item.qtyProduced)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function GlobalRepacksPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    }>
      <RepacksContent />
    </Suspense>
  );
}

function RepacksContent() {
  const [repacks, setRepacks] = useState<Repack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [sourceVariantId, setSourceVariantId] = useState('');
  const [sourceQtyUsed, setSourceQtyUsed] = useState(1);
  const [note, setNote] = useState('');
  const [outputRows, setOutputRows] = useState<OutputRow[]>([
    { id: crypto.randomUUID(), targetVariantPackage: '', qtyProduced: 1, sellingPrice: 0, sizeInGram: 0 },
  ]);
  const [productSearch, setProductSearch] = useState('');
  const debouncedSearch = useDebounce(productSearch, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed data
  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId), [products, selectedProductId]);
  const sourceVariant = useMemo(() => selectedProduct?.variants.find((v) => v.id === sourceVariantId), [selectedProduct, sourceVariantId]);
  
  const filteredProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.stockQty || 0) - (a.stockQty || 0));
  }, [products]);

  const availableSourceVariants = useMemo(() => selectedProduct?.variants.filter((v) => (v.stock ?? 0) > 0) || [], [selectedProduct]);
  const availableOutputLabels = useMemo(() => VARIANT_LABELS.filter((label) => label !== sourceVariant?.package), [sourceVariant]);
  const totalQtyProduced = useMemo(() => outputRows.reduce((sum, row) => sum + (row.qtyProduced || 0), 0), [outputRows]);
  const sourceHpp = useMemo(() => {
    if (!sourceVariant) return 0;
    if (sourceVariant.hpp && sourceVariant.hpp > 0) return sourceVariant.hpp;
    if (sourceVariant.price && sourceVariant.price > 0) return sourceVariant.price;
    return selectedProduct?.currentHpp || 0;
  }, [sourceVariant, selectedProduct]);

  const costPerUnit = useMemo(() => {
    return totalQtyProduced > 0 && sourceHpp > 0
      ? (sourceHpp * sourceQtyUsed) / totalQtyProduced
      : 0;
  }, [totalQtyProduced, sourceHpp, sourceQtyUsed]);

  // Load Repacks
  const loadRepacks = useCallback(async (productId?: string) => {
    setLoading(true);
    try {
      const res = await api.repacks.list(productId);
      setRepacks(res.data);
    } catch {
      setError('Gagal memuat riwayat pecah produk.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Products
  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setIsSearching(true);
      try {
        const res = await getProductsFromDb(1, 100, undefined, debouncedSearch);
        if (mounted) setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        if (mounted) setIsSearching(false);
      }
    };
    loadProducts();
    return () => { mounted = false; };
  }, [debouncedSearch]);

  // Sync Repacks with selected product
  useEffect(() => {
    loadRepacks(selectedProductId);
  }, [selectedProductId, loadRepacks]);

  // Handle Search Params for Pre-selection
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');

  useEffect(() => {
    if (queryProductId && products.length > 0) {
      if (products.some(p => p.id === queryProductId)) {
        setSelectedProductId(queryProductId);
      }
    }
  }, [queryProductId, products]);

  // Form Handlers
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    setSourceVariantId('');
    setSourceQtyUsed(1);
  };

  const addOutputRow = useCallback(() => {
    setOutputRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), targetVariantPackage: '', qtyProduced: 1, sellingPrice: 0, sizeInGram: 0 },
    ]);
  }, []);

  const removeOutputRow = useCallback((id: string) => {
    setOutputRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const updateOutputRow = useCallback(
    (id: string, field: keyof Omit<OutputRow, 'id'>, value: string | number) => {
      setOutputRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    [],
  );

  const resetForm = () => {
    setSelectedProductId('');
    setSourceVariantId('');
    setSourceQtyUsed(1);
    setNote('');
    setOutputRows([
      { id: crypto.randomUUID(), targetVariantPackage: '', qtyProduced: 1, sellingPrice: 0, sizeInGram: 0 },
    ]);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!selectedProduct) {
      setError('Pilih produk terlebih dahulu.');
      return;
    }
    if (!sourceVariantId) {
      setError('Pilih varian sumber terlebih dahulu.');
      return;
    }
    if (!sourceVariant || sourceQtyUsed > (sourceVariant.stock ?? 0)) {
      setError(`Stok tidak mencukupi. Tersedia: ${sourceVariant?.stock ?? 0}`);
      return;
    }
    const invalidRows = outputRows.filter(
      (row) => !row.targetVariantPackage || row.qtyProduced < 1 || row.sellingPrice < 0,
    );
    if (invalidRows.length > 0) {
      setError('Lengkapi semua baris output terlebih dahulu. Pastikan varian terisi dan harga valid.');
      return;
    }

    const payload: CreateRepackDto = {
      productId: selectedProduct.id,
      sourceVariantId,
      sourceQtyUsed,
      note: note || undefined,
      items: outputRows.map((row) => ({
        targetVariantPackage: row.targetVariantPackage as string,
        qtyProduced: row.qtyProduced,
        sellingPrice: row.sellingPrice,
        sizeInGram: row.sizeInGram > 0 ? row.sizeInGram : undefined,
      })),
    };

    try {
      setIsSubmitting(true);
      await api.repacks.create(payload);
      resetForm();
      loadRepacks();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError?.message ?? 'Gagal memecah produk. Coba lagi atau hubungi support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-0 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Pecah Produk</h2>
          <p className="text-sm text-muted-foreground font-medium">Bongkar varian besar menjadi eceran dan hitung HPP barunya.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-500 font-bold backdrop-blur-xl animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area (Product & Config) */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <CardContent className="p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
              <Package className="w-4 h-4 text-primary" />
              1. Pilih Produk & Sumber
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Produk Target</label>
                <Combobox 
                  value={selectedProductId} 
                  onValueChange={(val) => handleProductChange(val ?? "")}
                  onInputValueChange={setProductSearch}
                >
                  <ComboboxTrigger className="h-14 font-black bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-5 shadow-sm hover:border-primary/30 transition-all text-left">
                    {selectedProduct ? (
                      <div className="flex flex-col items-start truncate overflow-hidden">
                        <span className="text-[9px] text-primary/70 font-black uppercase tracking-[0.15em] leading-none mb-1">
                          {selectedProduct.brand?.name || "Tanpa Brand"}
                        </span>
                        <span className="text-sm truncate w-full tracking-tight">
                          {selectedProduct.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 text-sm font-medium italic">Cari produk...</span>
                    )}
                  </ComboboxTrigger>
                  <ComboboxContent align="start" className="w-(--anchor-width) min-w-[340px] p-2 rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 zcustom">
                    <ComboboxInput placeholder="Cari by nama..." className="h-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2 border-none focus:ring-1 focus:ring-primary/20" />
                    <ComboboxEmpty className="h-[200px] flex items-center justify-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {isSearching ? "Searching..." : "Produk tidak ditemukan"}
                      </p>
                    </ComboboxEmpty>
                    <ComboboxList className="space-y-1 max-h-72 overflow-y-auto pr-1">
                      {isSearching && (
                        <div className="py-10 flex flex-col items-center justify-center gap-2 opacity-50">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Memuat produk...</p>
                        </div>
                      )}
                      {!isSearching && filteredProducts.map(p => (
                        <ComboboxItem 
                          key={p.id} 
                          value={p.id} 
                          className="rounded-xl py-3 px-4 font-black cursor-pointer hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-[10px] text-primary/70 font-black uppercase tracking-widest leading-none">{p.brand?.name || "Tanpa Brand"}</span>
                            <span className="text-sm tracking-tight truncate">{p.name}</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-wider flex items-center gap-1">
                                <Layers className="h-2.5 w-2.5" /> Total Stock: {p.stockQty || 0}
                              </span>
                            </div>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {selectedProduct && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Sumber Pecahan (Varian)</label>
                  <Combobox 
                    value={sourceVariantId} 
                    onValueChange={(val) => setSourceVariantId(val ?? "")}
                  >
                    <ComboboxTrigger className="h-14 font-black bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-5 shadow-sm hover:border-primary/30 transition-all text-left">
                      {sourceVariant ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="uppercase">{sourceVariant.package}</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-lg text-[10px] uppercase font-bold tracking-widest">
                            {sourceVariant.stock} Tersedia
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 text-sm font-medium italic">Pilih varian sumber...</span>
                      )}
                    </ComboboxTrigger>
                    <ComboboxContent align="start" className="w-(--anchor-width) min-w-[200px] p-2 rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 gap-1 flex flex-col">
                      <ComboboxList className="space-y-1">
                        {availableSourceVariants.length === 0 ? (
                          <div className="py-4 text-center text-xs text-muted-foreground/50 font-black uppercase tracking-widest">Tidak ada varian berstok</div>
                        ) : (
                          availableSourceVariants.map(v => (
                            <ComboboxItem 
                              key={v.id} 
                              value={v.id} 
                              className="rounded-xl py-3 px-4 font-black cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between"
                            >
                              <span className="uppercase text-sm">{v.package}</span>
                              <span className="text-[10px] text-muted-foreground/50">{v.stock} pcs</span>
                            </ComboboxItem>
                          ))
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              )}
            </div>

            {sourceVariant && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/50 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-primary/5 dark:bg-primary/5 border border-primary/20 p-5 rounded-2xl">
                  <div className="flex-1 space-y-1 w-full relative">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 px-1">Jumlah Sumber Dipakai</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={sourceVariant.stock ?? 1}
                        value={sourceQtyUsed}
                        onChange={(e) => setSourceQtyUsed(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-14 font-black text-2xl px-6 bg-white dark:bg-gray-950 border-primary/20 rounded-2xl shadow-sm pr-20"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/50 uppercase tracking-widest pointer-events-none">
                        PCS
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block h-12 w-px bg-primary/20" />
                  <div className="flex-1 w-full space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">HPP per unit asal</p>
                    <p className="text-2xl font-black text-foreground">{formatIDR(sourceHpp)}</p>
                  </div>
                </div>
              </div>
            )}
            </CardContent>
          </Card>

          <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-primary" />
                2. Target Hasil Pecahan
              </h3>
              <Button
                variant="outline"
                onClick={addOutputRow}
                disabled={!sourceVariantId}
                className="gap-2 shrink-0 rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                + Tambah Varian
              </Button>
            </div>

            {!sourceVariantId ? (
              <div className="py-12 flex items-center justify-center text-center px-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest leading-relaxed">
                  Pilih produk & varian sumber <br/>untuk menambahkan target pecahan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {outputRows.map((row) => {
                  const margin = costPerUnit > 0 && row.sellingPrice > 0
                    ? ((row.sellingPrice - costPerUnit) / costPerUnit) * 100
                    : 0;

                  return (
                    <div key={row.id} className="relative group bg-white/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/50 p-4 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                      
                      <button 
                        type="button" 
                        onClick={() => removeOutputRow(row.id)} 
                        disabled={outputRows.length === 1}
                        className="absolute -top-3 -right-3 h-8 w-8 bg-white dark:bg-gray-800 border-2 border-transparent hover:border-red-100 flex items-center justify-center text-muted-foreground/30 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shadow-sm z-10 disabled:opacity-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Label Varian</label>
                          <Combobox 
                            value={row.targetVariantPackage} 
                            onValueChange={(val) => updateOutputRow(row.id, 'targetVariantPackage', val ?? "")}
                          >
                            <ComboboxTrigger className="h-14 font-black bg-white dark:bg-gray-950 border-gray-200/50 dark:border-gray-800/50 rounded-xl px-5 shadow-sm hover:border-primary/30 transition-all text-left uppercase">
                              {row.targetVariantPackage || <span className="text-muted-foreground/40 normal-case italic">Pilih Varian...</span>}
                            </ComboboxTrigger>
                            <ComboboxContent align="start" className="w-(--anchor-width) min-w-[200px] p-2 rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 gap-1 flex flex-col">
                              <ComboboxList className="space-y-1">
                                {availableOutputLabels.map(label => (
                                  <ComboboxItem 
                                    key={label} 
                                    value={label} 
                                    className="rounded-xl py-3 px-4 font-black cursor-pointer hover:bg-primary/5 transition-colors uppercase text-sm"
                                  >
                                    {label}
                                  </ComboboxItem>
                                ))}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Qty Output</label>
                          <div className="relative">
                            <Input
                              type="number"
                              min={1}
                              value={row.qtyProduced}
                              onChange={(e) => updateOutputRow(row.id, 'qtyProduced', Math.max(1, parseInt(e.target.value) || 1))}
                              className="h-14 font-black px-4 bg-white dark:bg-gray-950 border-gray-200/50 dark:border-gray-800/50 rounded-xl text-center"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest pointer-events-none">
                              PCS
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Gram Output</label>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={row.sizeInGram || ''}
                              onChange={(e) => updateOutputRow(row.id, 'sizeInGram', parseInt(e.target.value) || 0)}
                              className="h-14 font-black px-4 bg-white dark:bg-gray-950 border-gray-200/50 dark:border-gray-800/50 rounded-xl text-center"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest pointer-events-none">
                              {(row.sizeInGram || 0) >= 1000 ? "KG" : "GR"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Harga Jual / Unit</label>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={row.sellingPrice || ''}
                              onChange={(e) => updateOutputRow(row.id, 'sellingPrice', parseInt(e.target.value) || 0)}
                              className="h-14 font-black pl-10 pr-4 bg-white dark:bg-gray-950 border-gray-200/50 dark:border-gray-800/50 rounded-xl text-right"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/40 pointer-events-none">
                              Rp
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Margin Insights Row within the item */}
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200/50 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Est Margin:</span>
                        {row.sellingPrice > 0 && costPerUnit > 0 ? (
                          <MarginBadge margin={margin} />
                        ) : (
                          <span className="text-[10px] font-black text-muted-foreground/20 italic">MENUNGGU HARGA</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Right Area (Intelligence & Submit) */}
        <div className="space-y-8">
          <Card className="sticky top-6 border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <CardContent className="p-8 flex flex-col gap-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Intelligence
            </h3>

            <div className="space-y-6">
              <div className="space-y-2 bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 block">Total Modal (HPP Asli)</span>
                <p className="text-2xl font-black text-foreground tracking-tighter">
                  {formatIDR(sourceHpp * sourceQtyUsed)}
                </p>
                <p className="text-[10px] text-muted-foreground/70 font-medium italic mt-1">
                  Berdasarkan stok {sourceQtyUsed} {sourceVariant?.package || 'unit'}.
                </p>
              </div>

              <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 block">Estimasi HPP Per Output</span>
                <p className="text-3xl font-black text-primary tracking-tighter">
                  {formatIDR(Math.round(costPerUnit))}
                </p>
                <div className="text-[10px] text-muted-foreground/70 font-medium italic mt-2 bg-white/50 dark:bg-gray-950/50 p-2 rounded-lg leading-relaxed">
                  Total Modal dibagi ke {totalQtyProduced || 0} unit output.
                  Harga Jual baris output dikurangi nilai ini untuk menghitung margin keuntungan.
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Keterangan Tambahan</label>
                <Textarea 
                  placeholder="Opsional: Tulis tujuan pecah produk..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none h-24 font-medium p-4 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedProduct || !sourceVariantId}
              className="w-full group relative h-16 overflow-hidden rounded-2xl bg-primary font-black uppercase tracking-widest text-[11px] italic transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] border border-white/10 text-primary-foreground shadow-xl mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Scissors className="h-5 w-5 transition-all duration-500 group-hover:rotate-45 group-hover:scale-110" />
                )}
                <span className="relative">
                  {isSubmitting ? 'Memproses...' : 'Proses Pecah Barang'}
                </span>
              </div>
            </Button>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* History Table below */}
      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-2 bg-primary rounded-full shadow-lg shadow-primary/20" />
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent leading-none">
              Riwayat Transaksi
            </h3>
            {selectedProduct && (
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                Filter: {selectedProduct.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <TableHead className="w-8" />
                <TableHead className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Waktu</TableHead>
                <TableHead className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Produk</TableHead>
                <TableHead className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Sumber</TableHead>
                <TableHead className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Output</TableHead>
                <TableHead className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/40" />
                  </TableCell>
                </TableRow>
              ) : repacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center">
                        <Scissors className="w-8 h-8 opacity-30" />
                      </div>
                      <p className="text-sm font-semibold">Belum ada riwayat pecah produk</p>
                      <p className="text-xs opacity-70">
                        Pilih produk dan isi form di atas untuk memulai transaksi
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                repacks.map((repack) => <RepackRow key={repack.id} repack={repack} />)
              )}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>

    </div>
  );
}
