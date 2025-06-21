
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
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check Internet Availability
        </h2>
        
        <p className="text-gray-600 mb-6">
          Enter your address to see if SpryFi is available in your area
        </p>
      </div>

      <AddressAutocomplete 
        onAddressSelected={handleAddressSelected}
        onNext={handleNext}
      />
    </div>
  );
};
