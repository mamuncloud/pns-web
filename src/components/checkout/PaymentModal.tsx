'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useOrderPolling } from '@/hooks/use-order-polling';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaymentModalProps {
  orderId: string | null;
  paymentUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ orderId, paymentUrl, isOpen, onClose }: PaymentModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const router = useRouter();
  const { status } = useOrderPolling(orderId);

  // Handle successful payment detected via polling
  useEffect(() => {
    if (status === 'COMPLETED') {
        toast.success('Pembayaran Berhasil! Pesanan Anda sedang diproses.');
        router.push('/checkout/success');
        onClose();
    } else if (status === 'CANCELLED' || status === 'EXPIRED') {
        toast.error('Pembayaran Gagal atau Kadaluarsa.');
        onClose();
    }
  }, [status, router, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Selesaikan Pembayaran
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  Scan QRIS atau gunakan metode pembayaran di bawah
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-xs h-8 border-zinc-300 dark:border-zinc-700" 
                onClick={() => window.open(paymentUrl || '', '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka di Tab Baru
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-grow bg-white dark:bg-black overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/80 z-10 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Memuat Sesi Pembayaran...</p>
                <p className="text-xs text-zinc-400 max-w-[200px] text-center mt-2">
                    Jika tidak muncul, klik tombol &quot;Buka di Tab Baru&quot; di atas.
                </p>
            </div>
          )}
          
          {paymentUrl ? (
            <iframe
              src={paymentUrl}
              className="w-full h-full border-none"
              title="Mayar Payment"
              onLoad={() => setIframeLoading(false)}
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Tautan Pembayaran Hilang</h3>
              <p className="text-zinc-500 mb-6">Terjadi kesalahan saat membuat sesi pembayaran.</p>
              <Button onClick={onClose}>Kembali ke Checkout</Button>
            </div>
          )}
        </div>

        <div className="p-3 bg-zinc-100 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-center items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Keamanan Terenkripsi
          </div>
          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
          <div className="text-[10px] text-zinc-400 font-medium">
            Didukung oleh Mayar.id
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
