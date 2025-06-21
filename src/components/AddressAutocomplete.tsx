
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

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
  const autocompleteRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google || !window.customElements) {
        setTimeout(initializeAutocomplete, 100);
        return;
      }

      const autocompleteEl = document.getElementById("spryfi-autocomplete");
      if (!autocompleteEl) return;

      autocompleteEl.addEventListener("gmpx-placechange", async () => {
        const selectedAddressValue = (autocompleteEl as any).value;
        if (!selectedAddressValue) return;

        setIsLoading(true);

        try {
          // Use PlacesService to get full details
          const map = document.createElement("div");
          const service = new window.google.maps.places.PlacesService(map);

          service.findPlaceFromQuery({
            query: selectedAddressValue,
            fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
          }, async (results: any[], status: any) => {
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results[0]) {
              setIsLoading(false);
              return;
            }

            const place = results[0];

            const components = place.address_components.reduce((acc: any, c: any) => {
              const type = c.types[0];
              acc[type] = c.long_name;
              return acc;
            }, {});

            const addressData: AddressData = {
              google_place_id: place.place_id,
              formatted_address: place.formatted_address,
              address_line1: `${components.street_number || ""} ${components.route || ""}`.trim(),
              address_line2: "",
              city: components.locality || components.sublocality || "",
              state: components.administrative_area_level_1 || "",
              zip_code: components.postal_code || "",
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            };

            console.log("Parsed address payload:", addressData);

            // Store the address data
            setSelectedAddress(addressData);
            onAddressSelected(addressData);

            // POST to backend route to check/insert into anchor_address
            try {
              const response = await fetch('/functions/v1/fwa-check', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify(addressData)
              });

              if (!response.ok) {
                throw new Error('Failed to process address');
              }

              const result = await response.json();
              console.log('Address processing result:', result);
            } catch (error) {
              console.error('Error processing address:', error);
            }

            setIsLoading(false);
          });
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

      <div id="autocomplete-wrapper" className="w-full max-w-xl mx-auto z-10">
        <gmpx-placeautocomplete
          id="spryfi-autocomplete"
          placeholder="Enter your address"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ display: 'block' }}
          theme="filled"
          ref={autocompleteRef}
        />
      </div>

      {selectedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Selected Address:</h4>
          <p className="text-green-700">{selectedAddress.formatted_address}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Processing address...
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={!selectedAddress || isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
