
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          setAddress(place.formatted_address);
        }
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!address || !autocompleteRef.current) return;

    setLoading(true);
    
    try {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        alert('Please select a valid address from the dropdown');
        setLoading(false);
        return;
      }

      const addressComponents = place.address_components;
      const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
      const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
      const city = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = addressComponents.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

      const addressLine1 = `${streetNumber} ${route}`.trim();
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      // First, insert or get anchor_address
      const { data: anchorData, error: anchorError } = await supabase
        .from('anchor_address')
        .upsert({
          address_line1: addressLine1,
          city,
          state,
          zip_code: zipCode,
          latitude,
          longitude,
          google_place_id: place.place_id,
          first_lead_id: null // Will be updated when we create the lead
        }, {
          onConflict: 'address_line1,city,state,zip_code',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (anchorError) {
        console.error('Error creating anchor address:', anchorError);
        alert('Error processing address. Please try again.');
        setLoading(false);
        return;
      }

      // Create leads_fresh record
      const { data: leadData, error: leadError } = await supabase
        .from('leads_fresh')
        .insert({
          address_line1: addressLine1,
          city,
          state,
          zip_code: zipCode,
          status: 'new'
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
        alert('Error creating lead. Please try again.');
        setLoading(false);
        return;
      }

      // Check qualification (simplified - you can expand this logic)
      const isQualified = anchorData.is_cb_valid || anchorData.qualified_cband || Math.random() > 0.3; // Mock qualification

      if (!isQualified) {
        // Add to drip marketing
        await supabase
          .from('drip_marketing')
          .insert({
            email: '', // Will be filled when we get contact info
            name: '',
            address: place.formatted_address,
            status: 'active',
            qualified: false
          });

        updateState({
          step: 'not-qualified',
          anchorAddressId: anchorData.id,
          leadId: leadData.id,
          address: {
            addressLine1,
            city,
            state,
            zipCode,
            latitude,
            longitude,
            googlePlaceId: place.place_id,
            formattedAddress: place.formatted_address
          },
          qualified: false
        });
      } else {
        updateState({
          step: 'contact',
          anchorAddressId: anchorData.id,
          leadId: leadData.id,
          address: {
            addressLine1,
            city,
            state,
            zipCode,
            latitude,
            longitude,
            googlePlaceId: place.place_id,
            formattedAddress: place.formatted_address
          },
          qualified: true
        });
      }
    } catch (error) {
      console.error('Error processing address:', error);
      alert('Error processing address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Where do you need internet service?
        </h2>
        <p className="text-gray-600">
          Enter your address to check availability
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!address || loading}
          className="w-full py-4 text-lg font-semibold rounded-lg"
          style={{
            background: address ? '#0047AB' : '#ccc',
            color: 'white'
          }}
        >
          {loading ? 'Checking...' : 'Check Availability'}
        </Button>
      </div>
    </div>
  );
};
