
import React, { useState } from 'react';
import { CheckoutState } from '../CheckoutModal';
import SimpleAddressInput from '../../SimpleAddressInput';
import { supabase } from '@/integrations/supabase/client';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addressSelected, setAddressSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  const parseAddress = (fullAddress: string) => {
    // Basic address parsing - you might want to enhance this
    const parts = fullAddress.split(',').map(part => part.trim());
    
    if (parts.length >= 4) {
      const addressLine1 = parts[0];
      const city = parts[1];
      const stateZip = parts[2].split(' ');
      const state = stateZip[0];
      const zipCode = stateZip[1] || '';
      
      return {
        addressLine1,
        city,
        state,
        zipCode,
        formattedAddress: fullAddress
      };
    }
    
    return {
      addressLine1: fullAddress,
      city: '',
      state: '',
      zipCode: '',
      formattedAddress: fullAddress
    };
  };

  const handleAddressSelected = async (address: string) => {
    console.log('ADDRESS SELECTED:', address);
    setSelectedAddress(address);
    setAddressSelected(true);
    
    // Parse the address
    const parsedAddress = parseAddress(address);
    
    // Update state with address (but don't run qualification yet)
    updateState({
      address: {
        ...parsedAddress,
        latitude: 0,
        longitude: 0,
        googlePlaceId: ''
      }
    });
  };

  const handleNext = async () => {
    if (!selectedAddress || !state.address) {
      alert('Please select an address first');
      return;
    }

    setLoading(true);

    try {
      // Insert address into anchor_address table (if not already present)
      const { data: existingAddress, error: checkError } = await supabase
        .from('anchor_address')
        .select('id')
        .eq('address_line1', state.address.addressLine1)
        .eq('city', state.address.city)
        .eq('zip_code', state.address.zipCode)
        .maybeSingle();

      let anchorAddressId: string;

      if (existingAddress) {
        anchorAddressId = existingAddress.id;
        console.log('Using existing address:', anchorAddressId);
      } else {
        // Insert new address
        const { data: newAddress, error: insertError } = await supabase
          .from('anchor_address')
          .insert({
            address_line1: state.address.addressLine1,
            address_line2: state.address.addressLine2 || null,
            city: state.address.city,
            state: state.address.state,
            zip_code: state.address.zipCode,
            latitude: state.address.latitude || 0,
            longitude: state.address.longitude || 0,
            status: 'active'
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Address insert error:', insertError);
          throw new Error('Failed to save address');
        }

        anchorAddressId = newAddress.id;
        console.log('Created new address:', anchorAddressId);
      }

      // Update state with anchor address ID and move to contact step
      updateState({
        anchorAddressId,
        step: 'contact'
      });

    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏠</div>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Where do you need Internet?
        </h2>
        
        <p className="text-sm text-gray-500 text-center mb-4">
          We'll check if SpryFi internet is available at your location
        </p>
      </div>

      <div className="space-y-6">
        <div className="w-full max-w-xl mx-auto">
          <SimpleAddressInput 
            onAddressSelect={handleAddressSelected}
            placeholder="Start typing your address..."
          />
          
          {selectedAddress && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Selected: {selectedAddress}</p>
            </div>
          )}
        </div>

        {addressSelected && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold py-3 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Takes just 30 seconds →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
