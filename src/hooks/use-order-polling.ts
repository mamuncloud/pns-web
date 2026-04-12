import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { OrderStatus } from '@/types/financial';

/**
 * Hook to poll order status until it is no longer PENDING.
 * Useful for QRIS payment sessions.
 */
export function useOrderPolling(orderId: string | null) {
  const [status, setStatus] = useState<OrderStatus | 'EXPIRED' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset status when orderId changes to null
  if (!orderId && status !== null) {
    setStatus(null);
  }

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const checkStatus = async (isInitial = false) => {
      if (isInitial) {
        setIsLoading(true);
      }
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
      } finally {
        if (isInitial) {
          setIsLoading(false);
        }
      }
    };

    // Initial check
    checkStatus(true);

    // Poll every 3 seconds
    intervalRef.current = setInterval(() => checkStatus(false), 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  return { status, isLoading, error };
}
