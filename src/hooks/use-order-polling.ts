import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/types/financial';

/**
 * Hook to poll order status until it is no longer PENDING.
 * Useful for QRIS payment sessions.
 */
export function useOrderPolling(orderId: string | null) {
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus(null);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await api.orders.get(orderId);
        const currentStatus = response.data.status;
        
        setStatus(currentStatus);

        // Stop polling if order is no longer pending
        if (currentStatus !== 'PENDING') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error polling order status:', err);
        setError('Failed to check order status');
      }
    };

    // Initial check
    setIsLoading(true);
    checkStatus().finally(() => setIsLoading(false));

    // Poll every 3 seconds
    intervalRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  return { status, isLoading, error };
}
