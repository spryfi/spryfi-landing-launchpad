
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { AddressSuggestions } from './AddressSuggestions';
import { AddressInputStates } from './AddressInputStates';
import { saveAddressToStorage, loadAddressFromStorage, clearAddressFromStorage } from '@/utils/addressFormUtils';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, isLoading, error, debouncedSearch, clearSuggestions } = useAddressSearch();

  // Form persistence - save input to localStorage
  useEffect(() => {
    if (inputValue && !addressSelected) {
      saveAddressToStorage(inputValue);
    }
  }, [inputValue, addressSelected]);

  // Restore form data on mount
  useEffect(() => {
    const savedAddress = loadAddressFromStorage();
    if (savedAddress) {
      setInputValue(savedAddress);
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (inputValue.length > 2 && !addressSelected) {
      debouncedSearch(inputValue);
      setShowSuggestions(true);
    } else {
      clearSuggestions();
      setShowSuggestions(false);
    }
  }, [inputValue, addressSelected, debouncedSearch, clearSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('✏️ Input changed:', value);
    setInputValue(value);
    setAddressSelected(false);
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
    clearSuggestions();
    clearAddressFromStorage();
    
    stableOnAddressSelect(suggestion.formatted);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && !addressSelected) {
      setShowSuggestions(true);
    }
  };

  const showNoResults = showSuggestions && suggestions.length === 0 && !isLoading && 
                       inputValue.length > 2 && !addressSelected && !error;

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
      
      <AddressInputStates
        isLoading={isLoading}
        error={error}
        showNoResults={showNoResults}
        addressSelected={addressSelected}
      />
      
      <AddressSuggestions
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        isVisible={showSuggestions && !addressSelected && !error}
      />

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
