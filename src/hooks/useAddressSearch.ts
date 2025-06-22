
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

  // Use environment variable or fallback token
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGRtY2tuaWdodCIsImEiOiJjbWM1bmp3MGcwcmpxMnJvaXNqeW15cDNqIn0._jS8MsELPUKSxU7ys6cxdg';

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const searchAddresses = useCallback(async (query: string) => {
    if (!mountedRef.current || query.length <= 2) return;

    console.log('🔍 Searching for:', query);
    console.log('🔑 Using Mapbox token:', MAPBOX_TOKEN ? 'Token present' : 'No token');
    
    setIsLoading(true);
    setError('');
    
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=US&` +
        `types=address,poi&` +
        `autocomplete=true&` +
        `limit=5`;
      
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📨 Full API Response:', data);
      
      if (mountedRef.current && data.features && Array.isArray(data.features)) {
        const addressOptions: AddressOption[] = data.features.map((feature: any) => ({
          display_name: feature.place_name,
          formatted: feature.place_name,
          place_name: feature.place_name
        }));
        
        console.log('✅ Processed suggestions:', addressOptions);
        setSuggestions(addressOptions);
        
        if (addressOptions.length === 0) {
          console.log('⚠️ No suggestions found for query:', query);
        }
      } else {
        console.log('⚠️ No features in API response');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suggestions';
      setError(errorMessage);
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
      console.log('🔄 Query too short, clearing suggestions');
      setSuggestions([]);
      setIsLoading(false);
      setError('');
    }
  }, [searchAddresses]);

  const clearSuggestions = useCallback(() => {
    console.log('🧹 Clearing suggestions');
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
