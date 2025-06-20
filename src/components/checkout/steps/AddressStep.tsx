import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';
import { MapPin, Loader2, Shield, CheckCircle } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState<'address' | 'contact' | 'result'>('address');
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [qualificationResult, setQualificationResult] = useState<{
    qualified: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      console.log('Initializing Google Places Autocomplete...');
      
      const autocompleteEl = document.getElementById('spryfi-autocomplete') as any;
      const nextButton = document.getElementById('next-button') as HTMLButtonElement;
      
      if (!autocompleteEl || !nextButton) {
        console.log('Elements not found, retrying...');
        setTimeout(initializeAutocomplete, 100);
        return;
      }

      // Wait for Google Maps to be fully loaded
      const checkGoogleMaps = () => {
        if (!window.google?.maps?.places) {
          console.log('Google Maps API not ready yet, retrying...');
          setTimeout(checkGoogleMaps, 500);
          return;
        }

        console.log('Google Maps API ready, setting up event listener...');

        autocompleteEl.addEventListener('gmpx-placechange', async (event: any) => {
          const place = event.target.value;
          console.log('Selected address:', place);

          if (!place) {
            setNextButtonEnabled(false);
            return;
          }

          // Use Google's PlacesService to get full details
          const map = document.createElement("div");
          const placesService = new window.google.maps.places.PlacesService(map);

          placesService.findPlaceFromQuery({
            query: place,
            fields: ['place_id', 'formatted_address', 'geometry', 'address_components']
          }, async (results: any[], status: any) => {
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results[0]) {
              console.warn('Place details not found');
              setNextButtonEnabled(false);
              return;
            }

            const result = results[0];
            console.log('Place details:', result);
            
            setSelectedAddress(result.formatted_address);
            setSelectedPlace(result);

            const payload = {
              address: result.formatted_address,
              place_id: result.place_id,
              latitude: result.geometry?.location?.lat(),
              longitude: result.geometry?.location?.lng(),
            };

            try {
              // Send to fwa-check API
              const response = await supabase.functions.invoke('fwa-check', {
                body: payload
              });

              console.log('FWA check response:', response);
              
              // Enable the NEXT button after API call
              setNextButtonEnabled(true);
              nextButton.disabled = false;
              nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
              
            } catch (error) {
              console.error('Error checking address:', error);
              setNextButtonEnabled(false);
            }
          });
        });

        console.log('Google Places Autocomplete initialized successfully');
      };

      checkGoogleMaps();
    };

    // Initialize after a short delay to ensure DOM is ready
    setTimeout(initializeAutocomplete, 100);
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('contact');
  };

  const saveLeadToDatabase = async () => {
    console.log('Saving lead to database...');
    
    const addressComponents = selectedPlace.address_components;
    const streetNumber = addressComponents?.find((c: any) => c.types.includes('street_number'))?.long_name || '';
    const route = addressComponents?.find((c: any) => c.types.includes('route'))?.long_name || '';
    const city = addressComponents?.find((c: any) => c.types.includes('locality'))?.long_name || '';
    const state = addressComponents?.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
    const zipCode = addressComponents?.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

    const addressLine1 = `${streetNumber} ${route}`.trim();

    const { data: leadData, error: leadError } = await supabase
      .from('leads_fresh')
      .insert({
        first_name: contactInfo.firstName,
        last_name: contactInfo.lastName,
        email: contactInfo.email,
        address_line1: addressLine1,
        city,
        state,
        zip_code: zipCode,
        status: 'contact_info',
        qualification_checked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (leadError) {
      throw new Error('Error saving lead: ' + leadError.message);
    }

    return leadData;
  };

  const runVerizonCheck = async () => {
    console.log('Running Verizon API check...');
    
    const verizonResponse = await supabase.functions.invoke('fwa-check', {
      body: {
        address: selectedPlace.formatted_address,
        place_id: selectedPlace.place_id,
        latitude: selectedPlace.geometry?.location?.lat(),
        longitude: selectedPlace.geometry?.location?.lng()
      }
    });

    if (verizonResponse.error) {
      throw new Error('Verizon API error: ' + verizonResponse.error.message);
    }

    return verizonResponse.data;
  };

  const runWebbotCheck = async () => {
    console.log('Running webbot fallback check...');
    
    // Simulate webbot check with random result
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult = {
      qualified: Math.random() > 0.7,
      network_type: 'fallback_check'
    };

    console.log('Webbot check result:', mockResult);
    return mockResult;
  };

  const handleCheckAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email) {
      alert('Please fill in all fields');
      return;
    }

    if (!selectedPlace) {
      alert('Please select a valid address first');
      return;
    }

    setLoading(true);
    
    try {
      // Save lead to database first
      const leadData = await saveLeadToDatabase();
      
      // Step 1: Try Verizon API first
      let qualified = false;
      
      try {
        const verizonResult = await runVerizonCheck();
        
        if (verizonResult.qualified) {
          console.log('✅ Verizon qualified');
          qualified = true;
        } else {
          console.log('❌ Verizon not qualified - trying webbot fallback');
          
          // Step 2: Run webbot fallback
          const webbotResult = await runWebbotCheck();
          qualified = webbotResult.qualified;
        }
      } catch (verizonError) {
        console.error('Verizon API failed, trying webbot:', verizonError);
        
        // If Verizon fails completely, still try webbot
        const webbotResult = await runWebbotCheck();
        qualified = webbotResult.qualified;
      }

      // Update lead with qualification result
      await supabase
        .from('leads_fresh')
        .update({
          qualified,
          qualification_result: qualified ? 'qualified' : 'not_qualified'
        })
        .eq('id', leadData.id);

      if (qualified) {
        console.log('🎉 Address qualified!');
        setQualificationResult({
          qualified: true,
          message: 'Great news! SpryFi is available at your address.'
        });
        
        // Update checkout state for continuing to next step
        updateState({
          step: 'contact',
          leadId: leadData.id,
          address: {
            addressLine1: leadData.address_line1,
            city: leadData.city,
            state: leadData.state,
            zipCode: leadData.zip_code,
            formattedAddress: selectedPlace.formatted_address,
            googlePlaceId: selectedPlace.place_id
          },
          contact: {
            email: contactInfo.email,
            phone: ''
          },
          qualified: true
        });
      } else {
        console.log('❌ Address not qualified');
        
        // Add to drip marketing
        await supabase
          .from('drip_marketing')
          .insert({
            email: contactInfo.email,
            name: `${contactInfo.firstName} ${contactInfo.lastName}`,
            address: selectedPlace.formatted_address,
            status: 'active',
            lead_id: leadData.id
          });

        setQualificationResult({
          qualified: false,
          message: "We're not quite there yet. You've been added to our waitlist and we'll notify you as soon as we expand coverage to your area."
        });
      }

      setCurrentStep('result');
      
    } catch (error) {
      console.error('Error in qualification flow:', error);
      alert('Error checking coverage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    console.log('Continuing to next step...');
  };

  const renderAddressStep = () => (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto relative">
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

      <div className="space-y-6">
        <div className="w-full px-0 py-0 relative z-10 bg-white">
          <gmpx-placeautocomplete
            id="spryfi-autocomplete"
            placeholder="Start typing your address"
            style={{ 
              width: '100%', 
              display: 'block',
              minHeight: '48px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}
            theme="filled"
            class="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-[#0047AB] outline-none"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4 text-[#0047AB]" />
          <span>No contracts • No credit checks • No hassle</span>
        </div>

        <button
          id="next-button"
          type="button"
          onClick={handleNext}
          disabled={!nextButtonEnabled}
          className="w-full py-3 text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: nextButtonEnabled ? '#0047AB' : '#9CA3AF',
            boxShadow: nextButtonEnabled ? '0 4px 12px rgba(0, 71, 171, 0.3)' : 'none'
          }}
        >
          NEXT
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          We only use your address to check coverage. No spam, no pressure.
        </p>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{
          background: 'linear-gradient(to right, #0047AB, #007FFF)',
        }}
      />
    </div>
  );

  const renderContactStep = () => (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto relative">
      <div className="text-center mb-8">
        <div className="mb-4">
          <MapPin className="w-8 h-8 text-[#0047AB] mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          Tell us about yourself
        </h2>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          We'll use this info to check availability and keep you updated.
        </p>
      </div>

      <form onSubmit={handleCheckAddress} className="space-y-4">
        <Input
          type="text"
          placeholder="First Name"
          value={contactInfo.firstName}
          onChange={(e) => setContactInfo(prev => ({ ...prev, firstName: e.target.value }))}
          className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
        />

        <Input
          type="text"
          placeholder="Last Name"
          value={contactInfo.lastName}
          onChange={(e) => setContactInfo(prev => ({ ...prev, lastName: e.target.value }))}
          className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
        />

        <Input
          type="email"
          placeholder="Email Address"
          value={contactInfo.email}
          onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
          className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
        />

        <Button
          type="submit"
          disabled={loading || !contactInfo.firstName || !contactInfo.lastName || !contactInfo.email}
          className="w-full py-3 text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: (contactInfo.firstName && contactInfo.lastName && contactInfo.email && !loading) ? '#0047AB' : '#9CA3AF',
            boxShadow: (contactInfo.firstName && contactInfo.lastName && contactInfo.email && !loading) ? '0 4px 12px rgba(0, 71, 171, 0.3)' : 'none'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking Coverage...
            </div>
          ) : (
            'CHECK MY ADDRESS'
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Selected address: {selectedAddress}
        </p>
      </form>

      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{
          background: 'linear-gradient(to right, #0047AB, #007FFF)',
        }}
      />
    </div>
  );

  const renderResultStep = () => (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto relative">
      {qualificationResult?.qualified ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Great news!</h2>
          <p className="text-green-700 mb-6">{qualificationResult.message}</p>
          <Button
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold"
          >
            Continue
          </Button>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">We're not quite there yet</h2>
          <p className="text-red-700 mb-6">{qualificationResult?.message}</p>
          <p className="text-sm text-gray-600">
            Thanks for your interest! We're expanding quickly and will let you know as soon as SpryFi becomes available in your area.
          </p>
        </div>
      )}

      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{
          background: 'linear-gradient(to right, #0047AB, #007FFF)',
        }}
      />
    </div>
  );

  switch (currentStep) {
    case 'address':
      return renderAddressStep();
    case 'contact':
      return renderContactStep();
    case 'result':
      return renderResultStep();
    default:
      return renderAddressStep();
  }
};
