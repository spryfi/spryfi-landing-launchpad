
import React, { useState, useRef, useEffect } from 'react';

interface AddressOption {
  display_name: string;
  formatted: string;
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock address suggestions (replace with real API)
  const mockAddresses: AddressOption[] = [
    { display_name: "123 Main Street, Austin, TX 78701", formatted: "123 Main Street, Austin, TX 78701, USA" },
    { display_name: "456 Oak Avenue, Austin, TX 78702", formatted: "456 Oak Avenue, Austin, TX 78702, USA" },
    { display_name: "789 Pine Road, Austin, TX 78703", formatted: "789 Pine Road, Austin, TX 78703, USA" },
    { display_name: "321 Elm Street, Austin, TX 78704", formatted: "321 Elm Street, Austin, TX 78704, USA" },
    { display_name: "654 Cedar Lane, Austin, TX 78705", formatted: "654 Cedar Lane, Austin, TX 78705, USA" }
  ];

  useEffect(() => {
    if (inputValue.length > 2) {
      setIsLoading(true);
      
      // Simulate API delay
      const timer = setTimeout(() => {
        const filtered = mockAddresses.filter(addr => 
          addr.display_name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (suggestion: AddressOption) => {
    console.log('Suggestion clicked:', suggestion.formatted);
    
    // Set the full formatted address
    setInputValue(suggestion.formatted);
    
    // Update the input field directly
    if (inputRef.current) {
      inputRef.current.value = suggestion.formatted;
    }
    
    // Hide suggestions
    setShowSuggestions(false);
    
    // Call callback with full address
    if (onAddressSelect) {
      onAddressSelect(suggestion.formatted);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
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
        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-2 shadow-lg z-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900">
                {suggestion.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleAddressInput;
