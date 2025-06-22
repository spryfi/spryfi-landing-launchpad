
import { useState, useRef, useEffect, useCallback } from 'react';

interface AddressOption {
  display_name: string;
  formatted: string;
  place_name: string;
}

export const useAddressSearch = () => {
  const [suggestions, setSuggestions] = useState<AddressOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGRtY2tuaWdodCIsImEiOiJjbWM1bmp3MGcwcmpxMnJvaXNqeW15cDNqIn0._jS8MsELPUKSxU7ys6cxdg';

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const searchAddresses = useCallback(async (query: string) => {
    if (!mountedRef.current || query.length <= 2) return;

    console.log('🔍 Searching for:', query);
    setIsLoading(true);
    setError('');
    
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=US&` +
        `types=address&` +
        `limit=5`;
      
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📨 API Response:', data);
      
      if (mountedRef.current && data.features) {
        const addressOptions: AddressOption[] = data.features.map((feature: any) => ({
          display_name: feature.place_name,
          formatted: feature.place_name,
          place_name: feature.place_name
        }));
        
        console.log('✅ Processed suggestions:', addressOptions);
        setSuggestions(addressOptions);
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
      if (mountedRef.current) {
        setSuggestions([]);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [MAPBOX_TOKEN]);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length > 2) {
      console.log('⏰ Debouncing search for:', query);
      debounceTimerRef.current = setTimeout(() => {
        searchAddresses(query);
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
      setError('');
    }
  }, [searchAddresses]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError('');
    setIsLoading(false);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    debouncedSearch,
    clearSuggestions
  };
};
