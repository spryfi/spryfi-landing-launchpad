
import React from 'react';

interface AddressOption {
  display_name: string;
  formatted: string;
  place_name: string;
}

interface AddressSuggestionsProps {
  suggestions: AddressOption[];
  onSuggestionClick: (suggestion: AddressOption) => void;
  isVisible: boolean;
}

export const AddressSuggestions: React.FC<AddressSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  isVisible
}) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
        >
          📍 {suggestion.display_name}
        </div>
      ))}
    </div>
  );
};
