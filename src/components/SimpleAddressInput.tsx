
import React, { useState, useRef, useEffect } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGRtY2tuaWdodCIsImEiOiJjbWM1bmp3MGcwcmpxMnJvaXNqeW15cDNqIn0._jS8MsELPUKSxU7ys6cxdg';

  useEffect(() => {
    if (inputValue.length > 2 && !addressSelected) {
      setIsLoading(true);
      
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?` +
            `access_token=${MAPBOX_TOKEN}&` +
            `country=US&` +
            `types=address&` +
            `limit=5`
          );
          
          const data = await response.json();
          
          if (data.features) {
            const addressOptions: AddressOption[] = data.features.map((feature: any) => ({
              display_name: feature.place_name,
              formatted: feature.place_name,
              place_name: feature.place_name
            }));
            
            setSuggestions(addressOptions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }
  }, [inputValue, MAPBOX_TOKEN, addressSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setAddressSelected(false);
  };

  const handleSuggestionClick = (suggestion: AddressOption) => {
    console.log('FULL ADDRESS SELECTED:', suggestion.formatted);
    
    setInputValue(suggestion.formatted);
    setAddressSelected(true);
    
    if (inputRef.current) {
      inputRef.current.value = suggestion.formatted;
      inputRef.current.blur(); // Remove focus to hide any remaining dropdowns
    }
    
    // Immediately hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onAddressSelect) {
      onAddressSelect(suggestion.formatted);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
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
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
          addressSelected 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 focus:border-blue-500'
        }`}
        autoComplete="off"
      />
      
      {addressSelected && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-green-500 text-xl">✅</span>
        </div>
      )}
      
      {isLoading && !addressSelected && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-2 shadow-lg z-50">
          <div className="text-gray-500 text-sm">Searching addresses...</div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && !addressSelected && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length > 2 && !addressSelected && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-3 shadow-lg z-50">
          <div className="text-gray-500 text-sm">No addresses found</div>
        </div>
      )}
    </div>
  );
};

export default SimpleAddressInput;
