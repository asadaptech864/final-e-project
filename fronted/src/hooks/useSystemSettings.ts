import { useState, useEffect, useCallback } from 'react';
import { SystemSettings } from '@/lib/roomPricing';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }
      const data = await response.json();
      // Backend returns settings directly, not wrapped in a settings property
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (section: string, data: any) => {
    try {
      const response = await fetch(`http://localhost:3001/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      // Refresh settings after update
      await fetchSettings();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update settings' 
      };
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { 
    settings, 
    loading, 
    error, 
    refreshSettings: fetchSettings,
    updateSettings 
  };
}; 