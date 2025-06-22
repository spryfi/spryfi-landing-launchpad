
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AddressOption {
  display_name: string;
  formatted: string;
  place_name: string;
}

interface Props {
  onAddressSelect?: (address: string) => void;
  placeholder?: string;
}

const SimpleAddressInput: React.FC<Props> = ({ 
  onAddressSelect, 
  placeholder = "Enter your address..." 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<AddressOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGRtY2tuaWdodCIsImEiOiJjbWM1bmp3MGcwcmpxMnJvaXNqeW15cDNqIn0._jS8MsELPUKSxU7ys6cxdg';

  // Form persistence - save input to localStorage
  useEffect(() => {
    if (inputValue && !addressSelected) {
      const formData = {
        address: inputValue,
        timestamp: Date.now()
      };
      localStorage.setItem('addressFormData', JSON.stringify(formData));
    }
  }, [inputValue, addressSelected]);

  // Restore form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('addressFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only restore if saved within last hour to avoid stale data
        if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
          setInputValue(parsed.address || '');
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
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
        setShowSuggestions(true);
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

  // Handle input changes with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputValue.length > 2 && !addressSelected) {
      console.log('⏰ Debouncing search for:', inputValue);
      debounceTimerRef.current = setTimeout(() => {
        debouncedSearch(inputValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      setError('');
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, addressSelected, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('✏️ Input changed:', value);
    setInputValue(value);
    setAddressSelected(false);
    setError('');
  };

  // Prevent form submission on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('⚠️ Enter key pressed - prevented form submission');
    }
  };

  // Stable callback to prevent unnecessary re-renders
  const stableOnAddressSelect = useCallback((address: string) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  }, [onAddressSelect]);

  const handleSuggestionClick = (suggestion: AddressOption) => {
    console.log('🎯 Address selected:', suggestion.formatted);
    
    setInputValue(suggestion.formatted);
    setAddressSelected(true);
    
    if (inputRef.current) {
      inputRef.current.value = suggestion.formatted;
      inputRef.current.blur();
    }
    
    // Clear suggestions and localStorage since address is selected
    setShowSuggestions(false);
    setSuggestions([]);
    setError('');
    localStorage.removeItem('addressFormData');
    
    stableOnAddressSelect(suggestion.formatted);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (mountedRef.current) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && !addressSelected) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
          addressSelected 
            ? 'border-green-500 bg-green-50' 
            : error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 focus:border-blue-500'
        }`}
        autoComplete="off"
      />
      
      {addressSelected && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-green-500 text-xl">✅</span>
        </div>
      )}
      
      {error && (
        <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-300 rounded-b-lg p-2 shadow-lg z-50">
          <div className="text-red-600 text-sm">⚠️ {error}</div>
        </div>
      )}
      
      {isLoading && !addressSelected && !error && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-2 shadow-lg z-50">
          <div className="text-gray-500 text-sm">🔍 Searching addresses...</div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && !addressSelected && !error && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
            >
              📍 {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length > 2 && !addressSelected && !error && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-3 shadow-lg z-50">
          <div className="text-gray-500 text-sm">❌ No addresses found</div>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400">
          Debug: Input length: {inputValue.length}, Loading: {isLoading.toString()}, 
          Suggestions: {suggestions.length}, Show: {showSuggestions.toString()}
        </div>
      )}
    </div>
  );
};

export default SimpleAddressInput;
