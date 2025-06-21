
import React, { useEffect, useRef, useState } from 'react';

// Declare Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: any) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              address_components?: any[];
            };
          };
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
    initAutocomplete?: () => void;
  }
}

interface Props {
  onAddressSelect?: (address: string) => void;
  value?: string;
}

const AddressAutocomplete: React.FC<Props> = ({ onAddressSelect, value = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        console.error('Google Maps not loaded');
        return;
      }

      try {
        // Create autocomplete instance
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'address_components']
          }
        );

        // Add place changed listener
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          console.log('Place selected:', place);
          
          if (place && place.formatted_address) {
            const fullAddress = place.formatted_address;
            console.log('Setting address:', fullAddress);
            
            // Update input value
            setInputValue(fullAddress);
            
            // Update input field directly
            if (inputRef.current) {
              inputRef.current.value = fullAddress;
            }
            
            // Call callback
            if (onAddressSelect) {
              onAddressSelect(fullAddress);
            }
          }
        });

      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      initializeAutocomplete();
    } else {
      // Wait for Google Maps to load
      window.initAutocomplete = initializeAutocomplete;
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Start typing your address..."
        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        autoComplete="off"
      />
    </div>
  );
};

export default AddressAutocomplete;
