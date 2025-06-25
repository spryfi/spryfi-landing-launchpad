
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
      console.log('🔄 Restored address from storage:', savedAddress);
      setInputValue(savedAddress);
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    console.log('🔄 Input effect triggered:', {
      inputLength: inputValue.length,
      addressSelected,
      suggestionsCount: suggestions.length
    });
    
    if (inputValue.length > 2 && !addressSelected) {
      console.log('🔄 Triggering search and showing suggestions for:', inputValue);
      debouncedSearch(inputValue);
      setShowSuggestions(true);
    } else if (inputValue.length <= 2) {
      console.log('🔄 Clearing suggestions - input too short');
      clearSuggestions();
      setShowSuggestions(false);
    }
  }, [inputValue, addressSelected, debouncedSearch, clearSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('✏️ Input changed:', value);
    setInputValue(value);
    setAddressSelected(false);
    
    // Reset error state when user starts typing
    if (error) {
      console.log('🔄 Resetting error state');
    }
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
    setShowSuggestions(false);
    
    // Clear suggestions and localStorage since address is selected
    clearSuggestions();
    clearAddressFromStorage();
    
    stableOnAddressSelect(suggestion.formatted);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      console.log('👋 Input blurred - hiding suggestions after delay');
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused, current state:', {
      inputLength: inputValue.length,
      suggestionsCount: suggestions.length,
      addressSelected
    });
    
    // Show suggestions if we have input and haven't selected an address
    if (inputValue.length > 2 && !addressSelected && suggestions.length > 0) {
      console.log('🎯 Showing suggestions on focus');
      setShowSuggestions(true);
    }
  };

  // Show suggestions when we have them and meet conditions
  useEffect(() => {
    if (suggestions.length > 0 && inputValue.length > 2 && !addressSelected && !error) {
      console.log('📋 Auto-showing suggestions, count:', suggestions.length);
      setShowSuggestions(true);
    }
  }, [suggestions, inputValue.length, addressSelected, error]);

  // Fixed logic for showing no results
  const showNoResults = inputValue.length > 2 && 
                       suggestions.length === 0 && 
                       !isLoading && 
                       !addressSelected && 
                       !error &&
                       showSuggestions;

  console.log('🔍 Render state:', {
    inputValue: inputValue.substring(0, 20) + (inputValue.length > 20 ? '...' : ''),
    suggestionsCount: suggestions.length,
    showSuggestions,
    showNoResults,
    isLoading,
    error: error ? 'Present' : 'None',
    addressSelected
  });

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
        spellCheck="false"
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
        isVisible={showSuggestions && suggestions.length > 0 && !addressSelected && !error}
      />

      {/* Debug info - visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 text-xs text-gray-400 bg-gray-50 rounded">
          <div>Debug Info:</div>
          <div>• Input: "{inputValue}" (length: {inputValue.length})</div>
          <div>• Loading: {isLoading.toString()}</div>
          <div>• Suggestions: {suggestions.length}</div>
          <div>• Show dropdown: {showSuggestions.toString()}</div>
          <div>• Show no results: {showNoResults.toString()}</div>
          <div>• Error: {error || 'None'}</div>
          <div>• Selected: {addressSelected.toString()}</div>
        </div>
      )}
    </div>
  );
};

export default SimpleAddressInput;
