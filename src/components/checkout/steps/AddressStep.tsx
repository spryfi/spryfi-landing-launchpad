
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleNext = async () => {
    if (!address || !city || !stateInput || !zipCode) {
      alert('Please fill in all address fields');
      return;
    }

    setLoading(true);

    try {
      const formattedAddress = `${address}, ${city}, ${stateInput} ${zipCode}`;

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
            state: stateInput,
            zip: zipCode,
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
          addressLine1: address,
          addressLine2: '',
          city,
          state: stateInput,
          zipCode,
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
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check Internet Availability
        </h2>
        
        <p className="text-gray-600 mb-6">
          Enter your address below to see if our fast, contract-free internet is available in your area.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main Street"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <Input
              id="city"
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <Input
              id="state"
              type="text"
              placeholder="CA"
              value={stateInput}
              onChange={(e) => setStateInput(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <Input
            id="zipCode"
            type="text"
            placeholder="12345"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-center text-xs text-gray-500 space-x-4 pt-4">
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
          onClick={handleNext}
          disabled={!address || !city || !stateInput || !zipCode || loading}
          className="w-full py-4 text-lg font-semibold rounded-lg transition-all"
        >
          {loading ? 'Checking availability...' : 'NEXT'}
        </Button>
      </div>
    </div>
  );
};
