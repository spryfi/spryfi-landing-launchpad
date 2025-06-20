
import React, { useState, useEffect } from 'react';
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
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google?.maps?.places) {
        console.log('Google Maps API not ready yet, retrying...');
        setTimeout(initializeAutocomplete, 500);
        return;
      }

      console.log('Initializing Google Places Autocomplete...');
      
      const autocompleteEl = document.getElementById('spryfi-autocomplete') as any;
      if (!autocompleteEl) {
        setTimeout(initializeAutocomplete, 100);
        return;
      }

      autocompleteEl.addEventListener('gmp-placechange', async () => {
        const selectedPlace = autocompleteEl.value;
        console.log('Place selected:', selectedPlace);
        
        if (!selectedPlace) {
          console.warn('No place selected');
          setButtonEnabled(false);
          return;
        }

        setAddress(selectedPlace);

        const autocompleteService = new window.google.maps.places.AutocompleteService();
        const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));

        autocompleteService.getPlacePredictions({ input: selectedPlace }, (predictions: any) => {
          if (!predictions?.length) {
            console.warn('No predictions found');
            setButtonEnabled(false);
            return;
          }

          const placeId = predictions[0].place_id;

          placesService.getDetails({ 
            placeId, 
            fields: ['place_id', 'formatted_address', 'geometry', 'address_components'] 
          }, async (place: any) => {
            if (!place?.place_id) {
              console.warn('Invalid place details');
              setButtonEnabled(false);
              return;
            }

            console.log('Place details received:', place);
            setSelectedPlace(place);
            setButtonEnabled(true);
          });
        });
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

  const runVerizonCheck = async (place: any) => {
    console.log('Running Verizon API check...');
    
    const addressComponents = place.address_components;
    const streetNumber = addressComponents?.find((c: any) => c.types.includes('street_number'))?.long_name || '';
    const route = addressComponents?.find((c: any) => c.types.includes('route'))?.long_name || '';
    const city = addressComponents?.find((c: any) => c.types.includes('locality'))?.long_name || '';
    const state = addressComponents?.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
    const zipCode = addressComponents?.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

    const addressLine1 = `${streetNumber} ${route}`.trim();
    const latitude = place.geometry?.location?.lat();
    const longitude = place.geometry?.location?.lng();

    const verizonResponse = await supabase.functions.invoke('fwa-check', {
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

    if (verizonResponse.error) {
      throw new Error('Verizon API error: ' + verizonResponse.error.message);
    }

    return {
      qualified: verizonResponse.data.qualified,
      network_type: verizonResponse.data.network_type,
      raw_data: verizonResponse.data.raw_data,
      addressLine1,
      city,
      state,
      zipCode,
      latitude,
      longitude
    };
  };

  const runWebbotCheck = async (place: any) => {
    console.log('Running webbot fallback check...');
    
    // This would call a webbot-check edge function
    // For now, we'll simulate it with a random result
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    const mockResult = {
      qualified: Math.random() > 0.7, // 30% qualification rate for fallback
      network_type: 'fallback_check',
      raw_data: {
        source: 'webbot',
        checked_at: new Date().toISOString()
      }
    };

    console.log('Webbot check result:', mockResult);
    return mockResult;
  };

  const createAnchorAddress = async (addressInfo: any, qualified: boolean, rawData: any) => {
    console.log('Creating/updating anchor_address...');
    const { data: anchorData, error: anchorError } = await supabase
      .from('anchor_address')
      .upsert({
        address_line1: addressInfo.addressLine1,
        city: addressInfo.city,
        state: addressInfo.state,
        zip_code: addressInfo.zipCode,
        latitude: addressInfo.latitude,
        longitude: addressInfo.longitude,
        google_place_id: selectedPlace.place_id,
        qualified_cband: qualified,
        raw_verizon_data: rawData,
        qualification_source: 'dual_api_check',
        status: qualified ? 'active' : 'inactive',
        qualified_at: qualified ? new Date().toISOString() : null
      }, {
        onConflict: 'address_line1,city,state,zip_code',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (anchorError) {
      throw new Error('Error creating anchor address: ' + anchorError.message);
    }

    return anchorData;
  };

  const createLead = async (addressInfo: any, qualified: boolean) => {
    console.log('Creating leads_fresh record...');
    const { data: leadData, error: leadError } = await supabase
      .from('leads_fresh')
      .insert({
        address_line1: addressInfo.addressLine1,
        city: addressInfo.city,
        state: addressInfo.state,
        zip_code: addressInfo.zipCode,
        qualified,
        qualification_result: qualified ? 'qualified' : 'not_qualified',
        qualification_checked_at: new Date().toISOString(),
        status: 'new'
      })
      .select()
      .single();

    if (leadError) {
      throw new Error('Error creating lead: ' + leadError.message);
    }

    return leadData;
  };

  const handleQualificationFlow = async () => {
    if (!selectedPlace) {
      alert('Please select a valid address first');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting qualification flow...');
      
      // Step 1: Try Verizon API first
      let qualificationResult;
      let addressInfo;
      
      try {
        const verizonResult = await runVerizonCheck(selectedPlace);
        addressInfo = verizonResult;
        
        if (verizonResult.qualified) {
          console.log('✅ Verizon qualified - proceeding');
          qualificationResult = {
            qualified: true,
            network_type: verizonResult.network_type,
            raw_data: verizonResult.raw_data,
            source: 'verizon'
          };
        } else {
          console.log('❌ Verizon not qualified - trying webbot fallback');
          
          // Step 2: Run webbot fallback
          const webbotResult = await runWebbotCheck(selectedPlace);
          
          qualificationResult = {
            qualified: webbotResult.qualified,
            network_type: webbotResult.network_type,
            raw_data: {
              verizon: verizonResult.raw_data,
              webbot: webbotResult.raw_data
            },
            source: webbotResult.qualified ? 'webbot_fallback' : 'both_failed'
          };
        }
      } catch (verizonError) {
        console.error('Verizon API failed, trying webbot:', verizonError);
        
        // If Verizon fails completely, still try webbot
        const webbotResult = await runWebbotCheck(selectedPlace);
        
        // We still need address info, so parse it from the place
        const addressComponents = selectedPlace.address_components;
        const streetNumber = addressComponents?.find((c: any) => c.types.includes('street_number'))?.long_name || '';
        const route = addressComponents?.find((c: any) => c.types.includes('route'))?.long_name || '';
        const city = addressComponents?.find((c: any) => c.types.includes('locality'))?.long_name || '';
        const state = addressComponents?.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
        const zipCode = addressComponents?.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

        addressInfo = {
          addressLine1: `${streetNumber} ${route}`.trim(),
          city,
          state,
          zipCode,
          latitude: selectedPlace.geometry?.location?.lat(),
          longitude: selectedPlace.geometry?.location?.lng()
        };
        
        qualificationResult = {
          qualified: webbotResult.qualified,
          network_type: webbotResult.network_type,
          raw_data: {
            verizon_error: verizonError.message,
            webbot: webbotResult.raw_data
          },
          source: 'webbot_only'
        };
      }

      // Create anchor address and lead
      const anchorData = await createAnchorAddress(addressInfo, qualificationResult.qualified, qualificationResult.raw_data);
      const leadData = await createLead(addressInfo, qualificationResult.qualified);

      // Handle result
      if (qualificationResult.qualified) {
        console.log('🎉 Address qualified! Advancing to contact step');
        updateState({
          step: 'contact',
          anchorAddressId: anchorData.id,
          leadId: leadData.id,
          address: {
            addressLine1: addressInfo.addressLine1,
            city: addressInfo.city,
            state: addressInfo.state,
            zipCode: addressInfo.zipCode,
            latitude: addressInfo.latitude,
            longitude: addressInfo.longitude,
            googlePlaceId: selectedPlace.place_id,
            formattedAddress: selectedPlace.formatted_address
          },
          qualified: true
        });
      } else {
        console.log('❌ Address not qualified');
        
        // Add to drip marketing
        await supabase
          .from('drip_marketing')
          .insert({
            email: '',
            name: '',
            address: selectedPlace.formatted_address,
            status: 'active',
            lead_id: leadData.id
          });

        updateState({
          step: 'not-qualified',
          anchorAddressId: anchorData.id,
          leadId: leadData.id,
          address: {
            addressLine1: addressInfo.addressLine1,
            city: addressInfo.city,
            state: addressInfo.state,
            zipCode: addressInfo.zipCode,
            latitude: addressInfo.latitude,
            longitude: addressInfo.longitude,
            googlePlaceId: selectedPlace.place_id,
            formattedAddress: selectedPlace.formatted_address
          },
          qualified: false
        });
      }

      console.log('Qualification flow completed successfully');
    } catch (error) {
      console.error('Error in qualification flow:', error);
      alert('Error checking coverage. Please try again.');
    } finally {
      setLoading(false);
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
          <gmp-place-autocomplete
            id="spryfi-autocomplete"
            placeholder="Start typing your address..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 16px',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              outline: 'none',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              color: '#111827'
            }}
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
          onClick={handleQualificationFlow}
          disabled={!buttonEnabled || loading}
          className="w-full py-3 text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: buttonEnabled && !loading ? '#0047AB' : '#9CA3AF',
            boxShadow: buttonEnabled && !loading ? '0 4px 12px rgba(0, 71, 171, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (buttonEnabled && !loading) {
              e.currentTarget.style.backgroundColor = '#0065D1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (buttonEnabled && !loading) {
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
