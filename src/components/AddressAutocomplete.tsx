
import React, { useEffect, useRef, useState } from 'react';

interface AddressData {
  google_place_id: string;
  formatted_address: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  anchor_address_id?: string;
}

interface AddressAutocompleteProps {
  onAddressSelected: (address: AddressData) => void;
  onNext: () => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  onAddressSelected, 
  onNext 
}) => {
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const autocompleteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.customElements?.get('gmpx-placeautocomplete')) {
        setTimeout(initializeAutocomplete, 100);
        return;
      }

      if (!autocompleteRef.current) return;

      const autocomplete = autocompleteRef.current as any;
      
      // Configure the autocomplete
      autocomplete.addEventListener('gmpx-placechange', async (event: any) => {
        const place = event.detail.place;
        
        if (!place || !place.geometry || !place.addressComponents) {
          console.log('No details available for selected place');
          return;
        }

        console.log('Selected place:', place);

        setIsLoading(true);
        setIsProcessed(false);

        try {
          // Parse address components
          const components = place.addressComponents.reduce((acc: any, component: any) => {
            component.types.forEach((type: string) => {
              acc[type] = component.longText;
              acc[`${type}_short`] = component.shortText;
            });
            return acc;
          }, {});

          console.log('Address components:', components);

          // Build complete address line 1
          const streetNumber = components.street_number || '';
          const route = components.route || '';
          const premise = components.premise || '';
          const subpremise = components.subpremise || '';
          
          // Construct address line 1 with all available parts
          let addressLine1 = '';
          if (streetNumber && route) {
            addressLine1 = `${streetNumber} ${route}`;
          } else if (route) {
            addressLine1 = route;
          } else if (premise) {
            addressLine1 = premise;
          }
          
          // Add unit/apartment info if available
          let addressLine2 = '';
          if (subpremise) {
            addressLine2 = `Unit ${subpremise}`;
          }

          const addressData: AddressData = {
            google_place_id: place.id || '',
            formatted_address: place.formattedAddress || '',
            address_line1: addressLine1.trim(),
            address_line2: addressLine2.trim(),
            city: components.locality || components.sublocality_level_1 || components.administrative_area_level_3 || '',
            state: components.administrative_area_level_1_short || components.administrative_area_level_1 || '',
            zip_code: components.postal_code || '',
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          };

          console.log("Parsed address payload:", addressData);

          // POST to backend route to check/insert into anchor_address
          try {
            const response = await fetch('/functions/v1/fwa-check', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcnp6cXF0bWlhemxzbXdwcm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDY1OTgsImV4cCI6MjA1NzkyMjU5OH0.bEvvlwbLBC2I7oDyWPyMF_B_d7Hkk8sTL8SvL2kFI6w`
              },
              body: JSON.stringify(addressData)
            });

            if (!response.ok) {
              throw new Error('Failed to process address');
            }

            const result = await response.json();
            console.log('Address processing result:', result);
            
            // Add the anchor_address_id to our address data
            const finalAddressData = {
              ...addressData,
              anchor_address_id: result.anchor_address_id
            };

            // Store the address data and notify parent
            setSelectedAddress(finalAddressData);
            onAddressSelected(finalAddressData);
            setIsProcessed(true);

          } catch (error) {
            console.error('Error processing address:', error);
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error with address selection:', error);
          setIsLoading(false);
        }
      });
    };

    initializeAutocomplete();
  }, [onAddressSelected]);

  return (
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
        <gmpx-placeautocomplete
          ref={autocompleteRef}
          id="address-autocomplete"
          placeholder="Start typing your address..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        />
      </div>

      {selectedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Selected Address:</h4>
          <p className="text-green-700">{selectedAddress.formatted_address}</p>
          <div className="text-sm text-green-600 mt-2">
            <p>Address Line 1: {selectedAddress.address_line1}</p>
            {selectedAddress.address_line2 && <p>Address Line 2: {selectedAddress.address_line2}</p>}
            <p>City: {selectedAddress.city}, State: {selectedAddress.state}, ZIP: {selectedAddress.zip_code}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Processing address...
        </div>
      )}

      <div className="flex justify-end">
        <button 
          onClick={onNext}
          disabled={!isProcessed || isLoading}
          className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-6 py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};
