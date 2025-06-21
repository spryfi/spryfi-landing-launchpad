
import React from 'react';
import { CheckoutState } from '../CheckoutModal';
import AddressAutocomplete from '../../AddressAutocomplete';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const handleAddressSelected = (address: string) => {
    console.log('Full address selected:', address);
    // Parse the address and update state - for now just storing the formatted address
    updateState({
      address: {
        formattedAddress: address,
        addressLine1: '', // Will need to parse these from the full address
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        latitude: 0,
        longitude: 0,
        googlePlaceId: ''
      }
    });
  };

  const handleNext = () => {
    // Move to contact step for email and name collection
    updateState({ step: 'contact' });
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏠</div>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Let's see if SpryFi works at your address
        </h2>
        
        <p className="text-sm text-gray-500 text-center mb-4">
          Takes just 30 seconds — no commitments, no spam.
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Enter Your Address
          </h3>
          <p className="text-gray-600">
            We'll check if SpryFi internet is available in your area
          </p>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <AddressAutocomplete 
            onAddressSelect={handleAddressSelected}
          />
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleNext}
            disabled={!state.address?.formattedAddress}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-6 py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
