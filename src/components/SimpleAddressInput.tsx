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

interface ParsedAddress {
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  full_address: string;
}

interface Props {
  onAddressSelect?: (address: string, parsedAddress: ParsedAddress) => void;
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

  // Parse Mapbox address response into components
  const parseMapboxAddress = (suggestion: AddressOption): ParsedAddress => {
    console.log('🔍 Parsing Mapbox address:', suggestion);
    
    const fullAddress = suggestion.place_name || suggestion.formatted;
    const parts = fullAddress.split(', ');
    // Example: "1355 Rich Lane, Buda, Texas 78610, United States"
    // parts = ['1355 Rich Lane', 'Buda', 'Texas 78610', 'United States']
    
    console.log('📝 Address parts:', parts);
    
    // Extract state and zip from "Texas 78610" 
    const stateZipPart = parts[2] || ''; // "Texas 78610"
    const stateZipMatch = stateZipPart.match(/^(\w+)\s+(\d{5})$/);
    
    const state = stateZipMatch ? stateZipMatch[1] : '';
    const zipCode = stateZipMatch ? stateZipMatch[2] : '';
    
    // Convert state name to abbreviation
    const stateMap: { [key: string]: string } = {
      'Texas': 'TX',
      'California': 'CA', 
      'Florida': 'FL',
      'New York': 'NY',
      'Illinois': 'IL',
      'Pennsylvania': 'PA',
      'Ohio': 'OH',
      'Georgia': 'GA',
      'North Carolina': 'NC',
      'Michigan': 'MI'
    };
    
    const stateAbbr = stateMap[state] || state;
    
    const parsed = {
      address_line1: parts[0] || '',
      city: parts[1] || '',
      state: stateAbbr,
      zip_code: zipCode,
      full_address: fullAddress
    };
    
    console.log('✅ Parsed address components:', parsed);
    return parsed;
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
  const stableOnAddressSelect = useCallback((address: string, parsedAddress: ParsedAddress) => {
    if (onAddressSelect) {
      onAddressSelect(address, parsedAddress);
    }
  }, [onAddressSelect]);

  const handleSuggestionClick = (suggestion: AddressOption) => {
    console.log('🎯 Address selected:', suggestion.formatted);
    
    const fullAddress = suggestion.place_name || suggestion.formatted;
    const parsedAddress = parseMapboxAddress(suggestion);
    
    setInputValue(fullAddress);
    setAddressSelected(true);
    setShowSuggestions(false);
    
    // Clear suggestions and localStorage since address is selected
    clearSuggestions();
    clearAddressFromStorage();
    
    stableOnAddressSelect(fullAddress, parsedAddress);
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
