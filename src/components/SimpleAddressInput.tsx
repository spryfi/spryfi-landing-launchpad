import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { AddressSuggestions } from './AddressSuggestions';
import { AddressInputStates } from './AddressInputStates';
import { saveAddressToStorage, loadAddressFromStorage, clearAddressFromStorage } from '@/utils/addressFormUtils';

interface AddressOption {
  display_name: string;
  formatted: string;
  place_name: string;
  properties?: any;
  context?: any[];
}

interface Props {
  onAddressSelect?: (address: string) => void;
  placeholder?: string;
}

const SimpleAddressInput: React.FC<Props> = ({ 
  onAddressSelect, 
  placeholder = "Enter your address..." 
}) => {
  const [inputValue, setInputValue] = useState(''); // Always start empty
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, isLoading, error, debouncedSearch, clearSuggestions } = useAddressSearch();

  // Clear any stored address data on mount to ensure fresh start
  useEffect(() => {
    console.log('🔄 SimpleAddressInput mounted - clearing storage for fresh start');
    clearAddressFromStorage();
    setInputValue(''); // Ensure input starts empty
    setAddressSelected(false);
    setShowSuggestions(false);
    clearSuggestions();
  }, [clearSuggestions]);

  // Form persistence - save input to localStorage (but don't restore on mount)
  useEffect(() => {
    if (inputValue && !addressSelected) {
      saveAddressToStorage(inputValue);
    }
  }, [inputValue, addressSelected]);

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
      
      // If there's exactly one suggestion, select it
      if (suggestions.length === 1) {
        handleSuggestionClick(suggestions[0]);
      }
    }
  };

  // Stable callback to prevent unnecessary re-renders
  const stableOnAddressSelect = useCallback((address: string) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  }, [onAddressSelect]);

  const handleSuggestionClick = (suggestion: AddressOption) => {
    console.log('🎯 Address selected:', suggestion.place_name);
    
    const fullAddress = suggestion.place_name || suggestion.formatted;
    
    // 1. Show FULL address in input field
    setInputValue(fullAddress);
    setAddressSelected(true);
    setShowSuggestions(false);
    
    // 2. Clear suggestions and localStorage since address is selected
    clearSuggestions();
    clearAddressFromStorage();
    
    // 3. Call the parent callback with the full address
    stableOnAddressSelect(fullAddress);
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
        className={`w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          addressSelected 
            ? 'bg-green-50 ring-2 ring-green-300' 
            : error
            ? 'bg-red-50 ring-2 ring-red-300'
            : 'bg-white'
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
    </div>
  );
};

export default SimpleAddressInput;
