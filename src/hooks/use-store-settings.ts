import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useStoreSettings() {
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.storeSettings.get();
      setIsStoreOpen(res.data.isStoreOpen);
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const interval = setInterval(fetchSettings, 30_000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  const toggleStoreStatus = async (newStatus: boolean) => {
    try {
      setIsUpdating(true);
      // Optimistic update
      setIsStoreOpen(newStatus);
      await api.storeSettings.update(newStatus);
      toast.success(newStatus ? 'Store is now OPEN.' : 'Store is now CLOSED.');
    } catch (error) {
      console.error('Failed to update store settings:', error);
      // Revert
      setIsStoreOpen(!newStatus);
      toast.error('Failed to update store status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isStoreOpen,
    isLoading,
    isUpdating,
    toggleStoreStatus,
    refreshStoreSettings: fetchSettings,
  };
}
