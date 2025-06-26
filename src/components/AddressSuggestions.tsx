
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
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm text-gray-700 transition-colors duration-150"
        >
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">📍</span>
            <span className="flex-1">{suggestion.display_name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
