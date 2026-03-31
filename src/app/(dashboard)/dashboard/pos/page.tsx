"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { getProductsFromDb } from "@/lib/products-db";
import { Product, ProductVariant } from "@/types/product";
import { api } from "@/lib/api";
import { CreateOrderDto, OrderType } from "@/types/financial";
import { EmptyProductState } from "@/components/dashboard/EmptyProductState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Percent
} from "lucide-react";
import { cn, getProductImageUrl } from "@/lib/utils";
import Image from "next/image";

interface DisplayVariant extends ProductVariant {
  productName: string;
  productImageUrl: string;
  productTaste: string[];
  productMargin?: number;
  productCurrentHpp?: number;
}

interface CartItem extends DisplayVariant {
  quantity: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
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

  const fetchProducts = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const { data } = await getProductsFromDb(1, 100, undefined, search);
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Gagal memuat produk.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearch || undefined);
  }, [debouncedSearch, fetchProducts]);

  // Transform products into a flat list of variants for display
  const displayVariants = useMemo(() => {
    const variants: DisplayVariant[] = [];
    products.forEach(p => {
      p.variants.forEach(v => {
        variants.push({
          ...v,
          productName: p.name,
          productImageUrl: p.imageUrl,
          productTaste: p.taste,
          productMargin: p.margin,
          productCurrentHpp: p.currentHpp
        });
      });
    });
    return variants;
  }, [products]);

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
        items: cart.map(item => ({
          productVariantId: item.id,
          quantity: item.quantity,
          price: item.price,
          // pricingRuleId is optional
        }))
      };

      const response = await api.orders.create(orderData);
      
      if (response.success) {
        toast.success(`Transaksi Berhasil! Total: Rp ${totalRevenue.toLocaleString('id-ID')}`);
        
        // Clear cart and refetch products to update stock without full reload
        setCart([]);
        fetchProducts();
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
    setIsConfirmOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-500">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2 shrink-0">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Kasir (POS)</h2>
            <p className="text-sm text-muted-foreground font-medium">Pilih produk untuk transaksi baru.</p>
          </div>
          {products.length > 0 && (
            <div className="relative w-full xl:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Cari camilan..." 
                className="pl-12 h-14 bg-white/50 dark:bg-gray-950/50 border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm focus:shadow-md focus:ring-primary/20 transition-all text-base font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayVariants.map((p) => (
                <Card 
                  key={p.id} 
                  className="cursor-pointer hover:border-primary/50 transition-all duration-300 group active:scale-95 shadow-sm border-gray-200/50 dark:border-gray-800/50 rounded-3xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl hover:shadow-xl hover:shadow-primary/5 min-h-[140px]"
                  onClick={() => addToCart(p)}
                >
                  <CardContent className="p-4 space-y-4">
                    <div className="aspect-square bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors border border-gray-100 dark:border-gray-800/50">
                       <Image
                         src={p.productImageUrl || getProductImageUrl(null)}
                         alt={p.productName}
                         fill
                         className="object-cover"
                         sizes="(max-width: 768px) 50vw, 25vw"
                         unoptimized
                       />
                       {p.productMargin && p.productMargin > 40 && (
                         <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 font-black text-[9px] uppercase tracking-tighter border-none shadow-sm">High Margin</Badge>
                       )}
                    </div>
                    <div className="space-y-1.5 mt-2">
                       <div className="flex flex-col">
                        <p className="text-sm font-black text-foreground leading-tight truncate">{p.productName}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{p.package}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">Stock: {p.stock || 0}</p>
                        <p className="text-sm font-black text-primary">Rp {p.price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-foreground truncate">{item.productName}</p>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{item.package}</p>
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

          <div className="grid grid-cols-2 gap-3 pt-2">
             <Button variant="outline" className="h-12 font-black uppercase text-[10px] tracking-widest border-2">
               <Banknote className="h-4 w-4 mr-2" /> Tunai
             </Button>
             <Button variant="outline" className="h-12 font-black uppercase text-[10px] tracking-widest border-2">
               <CreditCard className="h-4 w-4 mr-2" /> Qris/Kartu
             </Button>
          </div>

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
