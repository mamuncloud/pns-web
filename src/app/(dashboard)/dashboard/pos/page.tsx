"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { getProductsFromDb } from "@/lib/products-db";
import { Product, ProductVariant } from "@/types/product";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import { CreateOrderDto, OrderType, PaymentMethod, Event } from "@/types/financial";
import { EmptyProductState } from "@/components/dashboard/EmptyProductState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Wallet, 
  AlertCircle,
  CreditCard,
  Banknote,
  Percent,
  Package,
  Calendar,
  Store
} from "lucide-react";
import { cn, getProductImageUrl, formatWeight } from "@/lib/utils";
import Image from "next/image";

interface DisplayVariant extends ProductVariant {
  productName: string;
  productBrand?: string;
  productImageUrl: string;
  productTaste: string[];
  productMargin?: number;
  productCurrentHpp?: number;
}

interface CartItem extends DisplayVariant {
  quantity: number;
}


export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isInternalReload = useRef(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("store");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchProducts = useCallback(async (pageNum: number, search?: string, eventId?: string) => {
    setIsLoading(true);
    try {
      const { data, meta } = await getProductsFromDb(
        pageNum, 
        limit, 
        undefined, 
        search, 
        true, 
        undefined,
        'desc',
        eventId && eventId !== 'store' ? eventId : undefined
      );
      setProducts(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Gagal memuat produk.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.events.list();
      if (response.success) {
        // Only show OPEN events for POS
        setEvents(response.data.filter(e => e.status === 'OPEN'));
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, debouncedSearch || undefined, selectedEventId);
  }, [debouncedSearch, selectedEventId, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProducts(newPage, searchQuery || undefined, selectedEventId);
    }
  };

  // No longer flatting variants globally, but we still need helper mapping for cart
  const mapVariantToDisplay = (p: Product, v: ProductVariant): DisplayVariant => {
    return {
      ...v,
      productName: p.name,
      productBrand: p.brand?.name,
      productImageUrl: p.imageUrl,
      productTaste: p.taste,
      productMargin: p.margin,
      productCurrentHpp: p.currentHpp
    };
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isInternalReload.current) return;
      if (isProcessing || cart.length > 0) {
        e.preventDefault();
        e.returnValue = ""; 
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing, cart.length]);

  const addToCart = (variant: DisplayVariant) => {
    const existing = cart.find(item => item.id === variant.id);
    if (existing && existing.quantity >= (variant.stock ?? 0)) {
      toast.error("Stok tidak mencukupi!");
      return;
    }
    
    if ((variant.stock ?? 0) <= 0) {
      toast.error("Stok habis!");
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...variant, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalRevenue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalHpp = cart.reduce((acc, item) => acc + (item.hpp || item.price * 0.7) * item.quantity, 0);
  const totalProfit = totalRevenue - totalHpp;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const isMarginLow = averageMargin > 0 && averageMargin < 20;

  const checkoutAction = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const orderData: CreateOrderDto = {
        orderType: 'WALK_IN' as OrderType,
        paymentMethod: paymentMethod,
        paidAmount: paymentMethod === 'CASH' ? parseInt(paidAmount) || totalRevenue : totalRevenue,
        eventId: selectedEventId !== 'store' ? selectedEventId : undefined,
        items: cart.map(item => ({
          productVariantId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      };

      const response = await api.orders.create(orderData);
      
      if (response.success) {
        toast.success(`Transaksi Berhasil! Total: Rp ${totalRevenue.toLocaleString('id-ID')}`);
        
        // Clear cart and refetch products to update stock without full reload
        setCart([]);
        setPaidAmount("");
        fetchProducts(page, searchQuery || undefined, selectedEventId);
      } else {
        toast.error(response.message || "Gagal memproses transaksi.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      
      let errorMessage = "Terjadi kesalahan saat memproses transaksi.";
      if (error instanceof Error) {
        // Safe access to Axios error if it exists
        const axiosError = error as unknown as Record<string, unknown>;
        const response = axiosError.response as Record<string, unknown>;
        const data = response?.data as Record<string, unknown>;
        if (typeof data?.message === 'string') {
          errorMessage = data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'CASH') {
      const amount = parseInt(paidAmount) || 0;
      if (amount < totalRevenue) {
        toast.error("Jumlah bayar kurang!");
        return;
      }
    }
    
    setIsConfirmOpen(true);
  };

  const changeAmount = paymentMethod === 'CASH' 
    ? Math.max(0, (parseInt(paidAmount) || 0) - totalRevenue)
    : 0;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-500">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Kasir (POS)</h2>
              <p className="text-sm text-muted-foreground font-medium">Pilih produk untuk transaksi baru.</p>
            </div>

            <div className="h-12 w-[1px] bg-gray-200 dark:bg-gray-800 hidden xl:block mx-2" />

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Lokasi Jualan</label>
              <Select 
                value={selectedEventId} 
                onValueChange={(val) => {
                  if (cart.length > 0) {
                    toast.error("Kosongkan keranjang sebelum ganti lokasi!");
                    return;
                  }
                  setSelectedEventId(val);
                  if (val !== 'store') {
                    setPaymentMethod('MAYAR');
                  } else {
                    setPaymentMethod('CASH');
                  }
                }}
              >
                <SelectTrigger className="h-12 w-[220px] rounded-2xl border-2 border-gray-100 bg-white/50 backdrop-blur-sm font-bold">
                  <SelectValue placeholder="Pilih Lokasi" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2">
                  <SelectItem value="store" className="focus:bg-primary/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <span>Gudang Utama</span>
                    </div>
                  </SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id} className="focus:bg-primary/10 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Calendar className="h-4 w-4" />
                        <span>Event: {event.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative w-full xl:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Cari camilan..." 
              className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyProductState 
              title="Camilan Belum Terdaftar"
              description="Belum ada produk yang bisa dijual. Silakan tambahkan produk pertama Anda di menu Kelola Produk."
            />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <Card 
                    key={p.id} 
                    className="group border-gray-200/50 dark:border-gray-800/50 rounded-[2rem] bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex flex-col h-full">
                      {/* Product Header */}
                      <div className="p-4 flex gap-4">
                        <div className="h-20 w-20 shrink-0 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl relative overflow-hidden border border-gray-100 dark:border-gray-800/50">
                          <Image
                            src={p.imageUrl || getProductImageUrl(null)}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="80px"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex flex-col">
                            {p.brand?.name && (
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">{p.brand.name}</span>
                            )}
                            <div className="flex items-start justify-between gap-2">
                               <h4 className="text-lg font-black text-foreground leading-tight tracking-tight uppercase italic">{p.name}</h4>
                               {p.margin && p.margin > 40 && (
                                 <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[8px] uppercase tracking-tighter px-1.5 h-4">High Profit</Badge>
                               )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                            {p.taste.slice(0, 2).map(t => (
                              <Badge key={t} variant="outline" className="text-[9px] font-bold uppercase tracking-tighter px-1.5 h-4 border-gray-200 dark:border-gray-800">{t}</Badge>
                            ))}
                            <div className="flex items-center gap-1 ml-auto">
                              <Package className="h-2.5 w-2.5 text-muted-foreground/30" />
                              <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                                {p.variants.filter(v => (v.stock ?? 0) > 0).length} Sizes
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Variant Selection Area */}
                      <div className="px-4 pb-4 bg-gray-50/30 dark:bg-gray-900/10 border-t border-gray-100/50 dark:border-gray-800/50 pt-4 flex-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Pilih Ukuran/Paket:</p>
                        <div className="grid gap-2">
                          {p.variants
                            .filter(v => (v.stock ?? 0) > 0)
                            .map(v => (
                              <button
                                key={v.id}
                                onClick={() => addToCart(mapVariantToDisplay(p, v))}
                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all group/variant active:scale-[0.98]"
                              >
                                <div className="flex flex-col items-start">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{v.package}</span>
                                    {v.sizeInGram && v.sizeInGram > 0 && (
                                      <Badge variant="outline" className="text-[8px] font-bold h-3.5 px-1 border-primary/20 text-primary/60 bg-primary/5 uppercase tracking-tighter">{formatWeight(v.sizeInGram)}</Badge>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground">Stok: {v.stock}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-black text-primary">Rp {v.price.toLocaleString('id-ID')}</span>
                                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover/variant:bg-primary transition-colors">
                                    <Plus className="h-4 w-4 text-primary group-hover/variant:text-white" />
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-2"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Page</span>
                    <span className="h-12 w-12 flex items-center justify-center bg-primary text-white rounded-2xl font-black text-lg">{page}</span>
                    <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">of {totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-2xl border-2"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Cart & Intelligence */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none shrink-0">
        <div className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-900/10 flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Keranjang Belanja
          </h3>
          <Badge variant="outline" className="font-bold border-gray-200">{cart.length} Items</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-2">
              <ShoppingCart className="h-12 w-12" />
              <p className="text-xs font-black uppercase tracking-widest">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 group animate-in slide-in-from-right duration-300">
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-lg overflow-hidden relative">
                  <Image
                    src={item.productImageUrl || getProductImageUrl(null)}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-col">
                    {item.productBrand && (
                      <span className="text-[8px] font-black text-primary uppercase tracking-tighter mb-0.5">{item.productBrand}</span>
                    )}
                    <p className="text-xs font-black text-foreground truncate">{item.productName}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{item.package}</p>
                    {item.sizeInGram && item.sizeInGram > 0 && (
                      <span className="text-[9px] font-medium text-muted-foreground/60 tracking-tight">({formatWeight(item.sizeInGram)})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 px-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="text-[11px] font-black text-primary">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                  {/* Staff Intelligence: Cost Awareness */}
                  <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                    Est. Profit: <span className="text-green-600/70">Rp {( (item.price - (item.hpp || item.price * 0.7)) * item.quantity ).toLocaleString('id-ID')}</span>
                  </p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Intelligence Layer: Profit & Margin Monitor */}
        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/10 border-t border-gray-100/50 dark:border-gray-800/50 space-y-6">
          <div className="space-y-4">
             {/* Margin Meter */}
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                   <Percent className="h-3 w-3" /> Avg. Transaction Margin
                 </span>
                 <span className={cn("text-xs font-black", averageMargin > 30 ? "text-green-600" : isMarginLow ? "text-red-600" : "text-amber-600")}>
                   {averageMargin.toFixed(1)}%
                 </span>
               </div>
               <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                 <div 
                   className={cn("h-full transition-all duration-500", 
                     averageMargin > 30 ? "bg-green-500" : isMarginLow ? "bg-red-500" : "bg-amber-500"
                   )}
                   style={{ width: `${Math.min(100, averageMargin * 2)}%` }}
                 />
               </div>
             </div>

             {/* Profit Insight Alert */}
             {isMarginLow && (
               <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-start gap-3 animate-pulse">
                 <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                 <div>
                   <p className="text-[10px] font-black text-red-700 dark:text-red-300 uppercase tracking-tight">Warning: Profit Terlalu Rendah!</p>
                   <p className="text-[9px] text-red-600 dark:text-red-400 font-medium leading-tight mt-0.5">Margin transaksi ini berada di bawah batas sehat (20%). Pertimbangkan untuk mengurangi diskon.</p>
                 </div>
               </div>
             )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase">Subtotal</span>
              <span className="text-sm font-black text-foreground">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-800">
              <span className="text-sm font-black text-foreground uppercase tracking-widest">Total</span>
              <span className="text-2xl font-black text-primary">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
             {[
               { id: 'CASH', label: 'Tunai', icon: Banknote, color: 'emerald' },
               { id: 'EDC_BCA', label: 'EDC BCA', icon: Wallet, color: 'blue' },
               { id: 'MAYAR', label: 'QRIS', icon: CreditCard, color: 'rose' }
             ].map((method) => {
               const Icon = method.icon;
               const isActive = paymentMethod === method.id;
               const isDisabled = (method.id === 'CASH' || method.id === 'EDC_BCA') && selectedEventId !== 'store';
               
               return (
                 <button
                   key={method.id}
                   disabled={isDisabled}
                   onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                   className={cn(
                     "flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
                     isActive 
                       ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02] z-10" 
                       : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-muted-foreground hover:border-primary/30 hover:bg-primary/5",
                     isDisabled && "opacity-30 grayscale cursor-not-allowed border-dashed bg-gray-50 dark:bg-black"
                   )}
                 >
                   <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-primary/70")} />
                   <span className="text-[9px] font-black uppercase tracking-tighter text-center px-1">
                     {method.label}
                   </span>
                   {isActive && (
                     <div className="absolute top-1 right-1">
                       <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                     </div>
                   )}
                 </button>
               );
             })}
          </div>

          {paymentMethod === 'CASH' && (
            <div className="space-y-4 animate-in slide-in-from-top duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Jumlah Bayar (Tunai)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">Rp</span>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="pl-12 h-14 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-lg font-black focus:ring-primary/20 focus:border-primary transition-all"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Kembalian:</span>
                <span className="text-xl font-black text-primary">Rp {changeAmount.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[totalRevenue, totalRevenue + 5000, totalRevenue + 10000, 50000, 100000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-[10px] font-black bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary hover:text-primary transition-all"
                    onClick={() => setPaidAmount(amount.toString())}
                  >
                    Rp {amount.toLocaleString('id-ID')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button 
            className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
          >
            {isProcessing ? "Processing..." : "Proses Pembayaran"}
          </Button>
          
          <p className="text-[9px] text-center text-muted-foreground font-bold flex items-center justify-center gap-1 uppercase tracking-tighter">
            <Wallet className="h-3 w-3" /> Pastikan stok fisik sesuai sebelum pembayaran
          </p>
        </div>
      </div>
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Konfirmasi Pembayaran"
        description="Proses pembayaran untuk transaksi ini? Pastikan stok fisik sesuai."
        onConfirm={checkoutAction}
        confirmText="Proses"
        cancelText="Batal"
      />
    </div>
  );
}
