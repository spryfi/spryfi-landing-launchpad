import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-placeautocomplete': any;
    }
  }
}

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const { currentHook, isVisible } = useRotatingHook();

  useEffect(() => {
    const autocomplete = document.getElementById('spryfi-autocomplete') as any;

    if (autocomplete) {
      autocomplete.addEventListener('gmpx-placechange', (event: any) => {
        setSelectedAddress(event.detail.place.formatted_address);
      });
    }

    return () => {
      if (autocomplete) {
        autocomplete.removeEventListener('gmpx-placechange', (event: any) => {
          setSelectedAddress(event.detail.place.formatted_address);
        });
      }
    };
  }, []);

  const handleNext = async () => {
    if (!selectedAddress) {
      alert('Please select an address from the suggestions');
      return;
    }

    setLoading(true);

    try {
      const autocomplete = document.getElementById('spryfi-autocomplete') as any;
      const place = autocomplete?.place;

      if (!place) {
        alert('Could not retrieve address details. Please try again.');
        return;
      }

      const addressLine1 = place.name;
      const addressLine2 = place.formatted_address.replace(addressLine1 + ', ', '');
      const city = place.address_components.find((component: any) => component.types.includes('locality'))?.long_name;
      const stateShort = place.address_components.find((component: any) => component.types.includes('administrative_area_level_1'))?.short_name;
      const stateLong = place.address_components.find((component: any) => component.types.includes('administrative_area_level_1'))?.long_name;
      const zipCode = place.address_components.find((component: any) => component.types.includes('postal_code'))?.long_name;
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();
      const googlePlaceId = place.place_id;
      const formattedAddress = place.formatted_address;

      // Check availability via Supabase function
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: {
          address: formattedAddress
        }
      });

      if (error) {
        console.error("Function error:", error);
        updateState({ step: 'not-qualified' });
        return;
      }

      if (data.qualified === false) {
        updateState({ step: 'not-qualified' });
        return;
      }

      // Create a new lead in leads_fresh table
      const { data: leadData, error: leadError } = await supabase
        .from('leads_fresh')
        .insert([
          {
            address: formattedAddress,
            city: city,
            state: stateShort,
            zip: zipCode,
            latitude: latitude,
            longitude: longitude,
            qualified: data.qualified
          }
        ])
        .select()

      if (leadError) {
        console.error("Lead creation error:", leadError);
        alert('Could not save lead information. Please try again.');
        return;
      }

      const leadId = leadData[0].id;
      const anchorAddressId = data.anchor_address_id;

      updateState({
        step: 'contact',
        anchorAddressId: anchorAddressId,
        leadId: leadId,
        address: {
          addressLine1,
          addressLine2,
          city,
          state: stateShort,
          zipCode,
          latitude,
          longitude,
          googlePlaceId,
          formattedAddress
        },
        qualified: data.qualified
      });

    } catch (error) {
      console.error('Error:', error);
      alert('Error checking address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏠</div>
        
        <h2 
          className={`text-2xl font-bold text-gray-900 mb-2 transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentHook}
        </h2>
        
        <p className="text-gray-600 mb-6">
          Enter your address below to see if our fast, contract-free internet is available in your area.
        </p>
      </div>

      <div className="w-full z-10 relative bg-white space-y-4">
        <gmpx-placeautocomplete
          id="spryfi-autocomplete"
          placeholder="Start typing your address"
          theme="filled"
          style={{
            width: '100%', 
            display: 'block',
            minHeight: '48px',
            fontSize: '16px'
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
          <div className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            No contracts
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            No credit checks
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            No hassle
          </div>
        </div>

        <Button
          id="next-button"
          type="button"
          onClick={handleNext}
          disabled={!selectedAddress || loading}
          className={`w-full py-4 text-lg font-semibold rounded-lg transition-all ${
            selectedAddress && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? 'Checking availability...' : 'NEXT'}
        </Button>
      </div>
    </div>
  );
};
