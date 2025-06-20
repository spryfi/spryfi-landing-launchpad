
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';
import { MapPin, Loader2, Shield } from 'lucide-react';

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
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google?.maps?.places || !inputRef.current) {
        console.log('Google Maps API not ready yet, retrying...');
        setTimeout(initializeAutocomplete, 500);
        return;
      }

      console.log('Initializing Google Places Autocomplete...');
      
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        console.log('Place selected:', place);
        
        if (!place || !place.place_id) {
          console.warn('Invalid place selected');
          return;
        }

        setAddress(place.formatted_address || '');
        setSelectedPlace(place);
        
        // Automatically process the address selection
        await handleAddressSelection(place);
      });

      console.log('Google Places Autocomplete initialized successfully');
    };

    // Wait for the window to load completely
    if (document.readyState === 'complete') {
      initializeAutocomplete();
    } else {
      window.addEventListener('load', initializeAutocomplete);
      return () => window.removeEventListener('load', initializeAutocomplete);
    }
  }, []);

  const handleAddressSelection = async (place: any) => {
    setLoading(true);
    
    try {
      console.log('Processing address selection:', {
        place_id: place.place_id,
        formatted_address: place.formatted_address
      });

      const addressComponents = place.address_components;
      const streetNumber = addressComponents?.find((c: any) => c.types.includes('street_number'))?.long_name || '';
      const route = addressComponents?.find((c: any) => c.types.includes('route'))?.long_name || '';
      const city = addressComponents?.find((c: any) => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents?.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = addressComponents?.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

      const addressLine1 = `${streetNumber} ${route}`.trim();
      const latitude = place.geometry?.location?.lat();
      const longitude = place.geometry?.location?.lng();

      console.log('Parsed address components:', {
        addressLine1,
        city,
        state,
        zipCode,
        latitude,
        longitude
      });

      // Call the coverage API
      console.log('Calling fwa-check API...');
      const coverageResponse = await supabase.functions.invoke('fwa-check', {
        body: {
          address: place.formatted_address,
          place_id: place.place_id,
          latitude,
          longitude,
          address_components: {
            address_line1: addressLine1,
            city,
            state,
            zip_code: zipCode
          }
        }
      });

      console.log('Coverage API response:', coverageResponse);

      if (coverageResponse.error) {
        console.error('Coverage API error:', coverageResponse.error);
        alert('Error checking coverage. Please try again.');
        setLoading(false);
        return;
      }

      const { qualified, network_type, raw_data } = coverageResponse.data;
      console.log('Coverage result:', { qualified, network_type });

      // Create/update anchor_address
      console.log('Creating/updating anchor_address...');
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
          qualified_cband: qualified,
          raw_verizon_data: raw_data,
          qualification_source: 'verizon_api',
          status: qualified ? 'active' : 'inactive',
          qualified_at: qualified ? new Date().toISOString() : null
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

      console.log('Anchor address created/updated:', anchorData);

      // Create leads_fresh record
      console.log('Creating leads_fresh record...');
      const { data: leadData, error: leadError } = await supabase
        .from('leads_fresh')
        .insert({
          address_line1: addressLine1,
          city,
          state,
          zip_code: zipCode,
          qualified,
          qualification_result: qualified ? 'qualified' : 'not_qualified',
          qualification_checked_at: new Date().toISOString(),
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

      console.log('Lead created:', leadData);

      if (!qualified) {
        // Add to drip marketing
        console.log('Adding to drip marketing...');
        await supabase
          .from('drip_marketing')
          .insert({
            email: '',
            name: '',
            address: place.formatted_address,
            status: 'active',
            lead_id: leadData.id
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

      console.log('Address processing completed successfully');
    } catch (error) {
      console.error('Error processing address:', error);
      alert('Error processing address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!address) {
      alert('Please enter and select an address');
      return;
    }

    if (!selectedPlace) {
      alert('Please wait for address validation or select from the suggestions');
      return;
    }

    // Address selection should have already triggered
    if (selectedPlace && !loading) {
      await handleAddressSelection(selectedPlace);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto relative">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <MapPin className="w-8 h-8 text-[#0047AB] mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          Check if SpryFi works at your address
        </h2>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Enter your address below to see if our fast, contract-free internet is available in your area.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-6">
        <div className="relative">
          <input
            ref={inputRef}
            id="address-input"
            name="address"
            type="text"
            placeholder="Start typing your address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 placeholder-gray-400"
            autoComplete="off"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4 text-[#0047AB]" />
          <span>No contracts • No credit checks • No hassle</span>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSubmit}
          disabled={!address || loading}
          className="w-full py-3 text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: address && !loading ? '#0047AB' : '#9CA3AF',
            boxShadow: address && !loading ? '0 4px 12px rgba(0, 71, 171, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (address && !loading) {
              e.currentTarget.style.backgroundColor = '#0065D1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (address && !loading) {
              e.currentTarget.style.backgroundColor = '#0047AB';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking Coverage...
            </div>
          ) : (
            'CHECK AVAILABILITY'
          )}
        </Button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          We only use your address to check coverage. No spam, no pressure.
        </p>
      </div>

      {/* Blue Accent Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{
          background: 'linear-gradient(to right, #0047AB, #007FFF)',
        }}
      />
    </div>
  );
};
