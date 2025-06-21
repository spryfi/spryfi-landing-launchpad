
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
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initializeAutocomplete, 100);
        return;
      }

      if (!autocompleteRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.address_components) {
          console.log('No details available for selected place');
          return;
        }

        setIsLoading(true);
        setIsProcessed(false);

        try {
          const components = place.address_components.reduce((acc: any, c: any) => {
            const type = c.types[0];
            acc[type] = c.long_name;
            return acc;
          }, {});

          const addressData: AddressData = {
            google_place_id: place.place_id || '',
            formatted_address: place.formatted_address || '',
            address_line1: `${components.street_number || ""} ${components.route || ""}`.trim(),
            address_line2: "",
            city: components.locality || components.sublocality || "",
            state: components.administrative_area_level_1 || "",
            zip_code: components.postal_code || "",
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
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
            setInputValue(place.formatted_address || '');

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
        <input
          ref={autocompleteRef}
          type="text"
          placeholder="Start typing your address..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
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
