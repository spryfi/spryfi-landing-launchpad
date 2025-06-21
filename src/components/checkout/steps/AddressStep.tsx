
import React from 'react';
import { CheckoutState } from '../CheckoutModal';
import { AddressAutocomplete } from '../../AddressAutocomplete';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const handleAddressSelected = (addressData: any) => {
    updateState({
      address: {
        addressLine1: addressData.address_line1,
        addressLine2: addressData.address_line2,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zip_code,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        googlePlaceId: addressData.google_place_id,
        formattedAddress: addressData.formatted_address
      }
    });
  };

  const handleNext = () => {
    // Move to contact step or qualification check
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

      <AddressAutocomplete 
        onAddressSelected={handleAddressSelected}
        onNext={handleNext}
      />
    </div>
  );
};
