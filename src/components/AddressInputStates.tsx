
import React from 'react';

interface AddressInputStatesProps {
  isLoading: boolean;
  error: string;
  showNoResults: boolean;
  addressSelected: boolean;
}

export const AddressInputStates: React.FC<AddressInputStatesProps> = ({
  isLoading,
  error,
  showNoResults,
  addressSelected
}) => {
  if (error && !addressSelected) {
    return (
      <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-300 rounded-b-lg p-2 shadow-lg z-50">
        <div className="text-red-600 text-sm">⚠️ {error}</div>
      </div>
    );
  }

  if (isLoading && !addressSelected && !error) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-2 shadow-lg z-50">
        <div className="text-gray-500 text-sm">🔍 Searching addresses...</div>
      </div>
    );
  }

  if (showNoResults) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg p-3 shadow-lg z-50">
        <div className="text-gray-500 text-sm">❌ No addresses found</div>
      </div>
    );
  }

  return null;
};
