
import React, { useState } from 'react';
import { CheckoutState } from '../CheckoutModal';
import SimpleAddressInput from '../../SimpleAddressInput';
import { supabase } from '@/integrations/supabase/client';
import { QualificationBadge } from '@/components/QualificationBadge';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [qualificationSource, setQualificationSource] = useState<string>('');

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
    console.log('FULL ADDRESS SELECTED:', address);
    setSelectedAddress(address);
    setLoading(true);

    try {
      // Parse the address
      const parsedAddress = parseAddress(address);
      
      // Call the FWA check API with lead_id
      const { data, error } = await supabase.functions.invoke('fwa-check', {
        body: {
          lead_id: state.leadId, // Include lead_id from state
          formatted_address: address,
          address_line1: parsedAddress.addressLine1,
          address_line2: '',
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip_code: parsedAddress.zipCode,
          latitude: 0, // You might want to get these from Mapbox response
          longitude: 0,
          google_place_id: '' // Or mapbox_id if using Mapbox
        }
      });

      if (error) {
        console.error('FWA check error:', error);
        alert('Error checking address availability. Please try again.');
        return;
      }

      console.log('FWA check result:', data);
      
      // Set the qualification source for badge display
      setQualificationSource(data.source || 'none');

      // Update state with address and qualification results
      updateState({
        address: {
          ...parsedAddress,
          latitude: 0,
          longitude: 0,
          googlePlaceId: ''
        },
        anchorAddressId: data.anchor_address_id,
        qualified: data.qualified,
        qualificationResult: {
          source: data.source || 'none',
          network_type: data.network_type,
          max_speed_mbps: data.raw_data?.max_speed_mbps
        }
      });

      // Move to next step based on qualification
      if (data.qualified) {
        updateState({ step: 'qualification-success' });
      } else {
        updateState({ step: 'not-qualified' });
      }

    } catch (error) {
      console.error('Error during address check:', error);
      alert('Error checking address availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏠</div>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Great {state.contact?.firstName}! Now let's check your address
        </h2>
        
        <p className="text-sm text-gray-500 text-center mb-4">
          We'll see if SpryFi internet is available at your location
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
          <div className="relative">
            <SimpleAddressInput 
              onAddressSelect={handleAddressSelected}
              placeholder="Start typing your address..."
            />
            
            {/* Qualification Badge */}
            {qualificationSource && (
              <div className="absolute top-2 right-2 z-10" id="qual-status-badge">
                <QualificationBadge source={qualificationSource} />
              </div>
            )}
          </div>
          
          {selectedAddress && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Selected: {selectedAddress}</p>
              {qualificationSource && (
                <div className="mt-2">
                  <QualificationBadge source={qualificationSource} />
                </div>
              )}
            </div>
          )}
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-600">Checking availability...</span>
              </div>
            </div>
          )}
        </div>

        {/* Debug info */}
        {state.leadId && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 max-w-xl mx-auto">
            <p>Debug: Lead ID: {state.leadId}</p>
            <p>Contact: {state.contact?.firstName} {state.contact?.lastName} ({state.contact?.email})</p>
          </div>
        )}
      </div>
    </div>
  );
};
