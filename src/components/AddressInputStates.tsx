
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
      <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-300 rounded-b-lg p-3 shadow-xl z-50">
        <div className="text-red-600 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (isLoading && !addressSelected && !error) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg p-3 shadow-xl z-50">
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <span>🔍</span>
          <span>Searching addresses...</span>
        </div>
      </div>
    );
  }

  if (showNoResults) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg p-3 shadow-xl z-50">
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <span>❌</span>
          <span>No addresses found</span>
        </div>
      </div>
    );
  }

  return null;
};
