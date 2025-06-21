
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

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
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for both Google Maps API and extended components to be ready
    const waitForGoogle = setInterval(() => {
      if (window.google && window.google.maps && window.customElements?.get('gmpx-placeautocomplete')) {
        console.log('Google extended components and Maps API ready');
        setIsGoogleReady(true);
        clearInterval(waitForGoogle);
      }
    }, 200);

    // Cleanup interval after 30 seconds to prevent infinite checking
    const timeout = setTimeout(() => {
      clearInterval(waitForGoogle);
      console.error('Google Maps API or extended components failed to load');
    }, 30000);

    return () => {
      clearInterval(waitForGoogle);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isGoogleReady || !autocompleteRef.current) return;

    // Clear any existing content
    autocompleteRef.current.innerHTML = '';
    
    // Create the autocomplete element
    const autocompleteElement = document.createElement('gmpx-placeautocomplete');
    autocompleteElement.id = 'spryfi-autocomplete';
    autocompleteElement.setAttribute('placeholder', 'Start typing your address...');
    autocompleteElement.setAttribute('theme', 'filled');
    autocompleteElement.style.cssText = `
      display: block;
      width: 100%;
      min-height: 48px;
      font-size: 16px;
      font-family: inherit;
      pointer-events: auto !important;
      cursor: text !important;
    `;
    autocompleteElement.className = 'w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

    // Add event listener for place changes
    const handlePlaceChange = (event: any) => {
      console.log('Place changed:', event.detail);
      if (event.detail?.place?.formatted_address) {
        setSelectedAddress(event.detail.place.formatted_address);
      }
    };

    autocompleteElement.addEventListener('gmpx-placechange', handlePlaceChange);
    
    // Append to container
    autocompleteRef.current.appendChild(autocompleteElement);

    // Ensure the shadow DOM input is accessible after a short delay
    const makeInputAccessible = () => {
      setTimeout(() => {
        const shadowRoot = autocompleteElement.shadowRoot;
        if (shadowRoot) {
          const input = shadowRoot.querySelector('input');
          if (input) {
            input.style.pointerEvents = 'auto';
            input.style.cursor = 'text';
            input.style.userSelect = 'text';
            console.log('Made autocomplete input accessible');
          }
        }
      }, 500);
    };

    makeInputAccessible();

    return () => {
      autocompleteElement.removeEventListener('gmpx-placechange', handlePlaceChange);
    };
  }, [isGoogleReady]);

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
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check Internet Availability
        </h2>
        
        <p className="text-gray-600 mb-6">
          Enter your address below to see if our fast, contract-free internet is available in your area.
        </p>
      </div>

      <div className="w-full relative bg-white space-y-4">
        <div className="relative w-full z-20" style={{ pointerEvents: 'auto' }}>
          {isGoogleReady ? (
            <div 
              ref={autocompleteRef}
              className="w-full" 
              style={{ pointerEvents: 'auto' }}
            ></div>
          ) : (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 shadow-sm bg-gray-50">
              Loading address search...
            </div>
          )}
        </div>

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
          disabled={!selectedAddress || loading || !isGoogleReady}
          className={`w-full py-4 text-lg font-semibold rounded-lg transition-all ${
            selectedAddress && !loading && isGoogleReady
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
