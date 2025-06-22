
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
    console.log('🚀 searchAddresses called with query:', query, 'length:', query.length);
    
    if (!mountedRef.current) {
      console.log('❌ Component unmounted, aborting search');
      return;
    }
    
    if (query.length <= 2) {
      console.log('❌ Query too short, aborting search');
      return;
    }

    console.log('🔍 Starting address search for:', query);
    console.log('🔑 Mapbox token available:', MAPBOX_TOKEN ? 'YES' : 'NO');
    console.log('🔑 Token preview:', MAPBOX_TOKEN ? MAPBOX_TOKEN.substring(0, 20) + '...' : 'No token');
    
    setIsLoading(true);
    setError('');
    
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=US&` +
        `types=address,poi&` +
        `autocomplete=true&` +
        `limit=5`;
      
      console.log('📡 Making API request to:', url.substring(0, 100) + '...');
      console.log('📡 Full URL (check network tab):', url);
      
      const response = await fetch(url);
      
      console.log('📊 Response received:');
      console.log('📊 Status:', response.status);
      console.log('📊 Status Text:', response.statusText);
      console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid Mapbox token - check your API key');
        } else if (response.status === 403) {
          throw new Error('Mapbox API access forbidden - check your token permissions');
        } else {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('📨 Full API Response:', JSON.stringify(data, null, 2));
      
      if (mountedRef.current && data.features && Array.isArray(data.features)) {
        const addressOptions: AddressOption[] = data.features.map((feature: any) => ({
          display_name: feature.place_name,
          formatted: feature.place_name,
          place_name: feature.place_name
        }));
        
        console.log('✅ Processed suggestions count:', addressOptions.length);
        console.log('✅ First few suggestions:', addressOptions.slice(0, 3));
        setSuggestions(addressOptions);
        
        if (addressOptions.length === 0) {
          console.log('⚠️ No suggestions found for query:', query);
        }
      } else {
        console.log('⚠️ Invalid API response structure:', data);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('❌ Fetch error details:', error);
      console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suggestions';
      setError(errorMessage);
      if (mountedRef.current) {
        setSuggestions([]);
      }
    } finally {
      if (mountedRef.current) {
        console.log('🏁 Search completed, setting loading to false');
        setIsLoading(false);
      }
    }
  }, [MAPBOX_TOKEN]);

  const debouncedSearch = useCallback((query: string) => {
    console.log('⏰ debouncedSearch called with:', query, 'length:', query.length);
    
    if (debounceTimerRef.current) {
      console.log('⏰ Clearing existing debounce timer');
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length > 2) {
      console.log('⏰ Setting up debounce timer for:', query);
      debounceTimerRef.current = setTimeout(() => {
        console.log('⏰ Debounce timer fired, calling searchAddresses');
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
