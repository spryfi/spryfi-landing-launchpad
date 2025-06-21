
import React from 'react';
import { CheckoutState } from '../CheckoutModal';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏠</div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check Internet Availability
        </h2>
        
        <p className="text-gray-600 mb-6">
          Address form functionality has been removed and is ready for reimplementation.
        </p>
      </div>

      {/* Address form has been removed — ready for reimplementation */}
      <div className="w-full text-center">
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8">
          <p className="text-gray-500">Address form placeholder</p>
          <p className="text-sm text-gray-400 mt-2">Ready for new implementation</p>
        </div>
      </div>
    </div>
  );
};
