"use client";

import { useEffect, useState } from "react";
import { getProductsFromDb } from "@/lib/products-db";
import { Product } from "@/types/product";
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
import { cn } from "@/lib/utils";

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await getProductsFromDb(1, 100);
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
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

  const totalRevenue = cart.reduce((acc, item) => acc + (item.variants[0]?.price || 0) * item.quantity, 0);
  const totalHpp = cart.reduce((acc, item) => acc + (item.currentHpp || (item.variants[0]?.price || 0) * 0.7) * item.quantity, 0);
  const totalProfit = totalRevenue - totalHpp;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const isMarginLow = averageMargin > 0 && averageMargin < 20;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Transaksi Berhasil! Total: Rp ${totalRevenue.toLocaleString('id-ID')}`);
    setCart([]);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-500">
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Kasir (POS)</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pilih produk untuk transaksi baru</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari camilan..." 
              className="pl-10 h-11 font-bold rounded-xl border-gray-200 dark:border-gray-800 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <Card 
                key={p.id} 
                className="cursor-pointer hover:border-primary/50 transition-all group active:scale-95 shadow-sm border-gray-100 dark:border-gray-800"
                onClick={() => addToCart(p)}
              >
                <CardContent className="p-3 space-y-3">
                  <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                     <span className="text-2xl">🍿</span>
                     {p.margin && p.margin > 40 && (
                       <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 font-black text-[9px] uppercase tracking-tighter border-none">High Margin</Badge>
                     )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-foreground leading-tight truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Stock: {p.variants[0]?.stock || 0}</p>
                    <p className="text-sm font-black text-primary">Rp {p.variants[0]?.price.toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Cart & Intelligence */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between">
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
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-lg">🍟</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-foreground truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 px-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="text-[11px] font-black text-primary">Rp {((item.variants[0]?.price || 0) * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                  {/* Staff Intelligence: Cost Awareness */}
                  <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                    Est. Profit: <span className="text-green-600/70">Rp {( ((item.variants[0]?.price || 0) - (item.currentHpp || (item.variants[0]?.price || 0) * 0.7)) * item.quantity ).toLocaleString('id-ID')}</span>
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
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 space-y-6">
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
    </div>
  );
}
