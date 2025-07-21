
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';
import SimpleAddressInput from '@/components/SimpleAddressInput';
import { supabase } from '@/integrations/supabase/client';
import { saveUserData } from '@/utils/userDataUtils';

interface ParsedAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  full_address: string;
}

export const Hero = () => {
  const { currentHook, isVisible } = useRotatingHook();
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [parsedAddressData, setParsedAddressData] = useState<ParsedAddress | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualificationResult, setQualificationResult] = useState<{
    qualified: boolean;
    source?: string;
    network_type?: string;
    minsignal?: number;
    error?: boolean;
    message?: string;
  } | null>(null);

  React.useEffect(() => {
    if (showAddressModal) {
      console.log('🔄 Address modal opened - clearing all address data');
      setSelectedAddress('');
      setParsedAddressData(null);
      setShowContactModal(false);
      setShowResultsModal(false);
    }
  }, [showAddressModal]);

  React.useEffect(() => {
    const heroImages = [
      "/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png",
      "/lovable-uploads/8c1667e5-2814-4a78-abe6-4469911e4e24.png",
      "/lovable-uploads/c9f4e146-8c48-4411-8b5f-0c9ceb66fc4e.png",
      "/lovable-uploads/3ce628a3-58d7-4f62-972d-82411046939a.png",
      "/lovable-uploads/cd5c8c35-7747-4f47-9491-e9f1d0bc53df.png",
      "/lovable-uploads/4d57e83f-db1b-430a-8b7e-3be3e4f0f7b8.png",
      "/lovable-uploads/e5884a69-1d16-4c82-9387-c9bf9c831e61.png",
    ];

    let currentImage = 0;
    let intervalId: NodeJS.Timeout;

    const startRotation = () => {
      intervalId = setInterval(() => {
        currentImage = (currentImage + 1) % heroImages.length;
        const heroImg = document.getElementById("hero-image") as HTMLImageElement;
        if (heroImg) {
          heroImg.style.filter = "blur(4px)";
          heroImg.classList.add("opacity-0");

          setTimeout(() => {
            heroImg.src = heroImages[currentImage];
            heroImg.classList.remove("opacity-0");
            heroImg.style.filter = "blur(0px)";
          }, 1500);
        }
      }, 5000);
    };

    const timeoutId = setTimeout(startRotation, 100);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const parseMapboxAddress = (fullAddress: string): ParsedAddress => {
    console.log('🔍 Parsing Mapbox address:', fullAddress);
    
    // Split the address by commas and filter out "United States"
    const parts = fullAddress.split(',').map(part => part.trim()).filter(part => part !== 'United States');
    console.log('📝 Address parts after filtering:', parts);
    
    if (parts.length < 3) {
      console.error('❌ Address has insufficient parts:', parts.length);
      return {
        address_line1: fullAddress,
        city: '',
        state: '',
        zip_code: '',
        full_address: fullAddress
      };
    }

    // Extract street address (first part)
    const street = parts[0] || '';
    
    // Extract city (second to last part)
    const cityPart = parts[parts.length - 2] || '';
    
    // Extract state and zip from last part
    const lastPart = parts[parts.length - 1];
    console.log('🏛️ Processing last part:', lastPart);
    
    let statePart = '';
    let zipPart = '';
    
    // State name to abbreviation mapping
    const stateNameToAbbrev: { [key: string]: string } = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    
    // Extract ZIP code using flexible pattern (5 digits or 5+4 format)
    const zipMatch = lastPart.match(/(\d{5}(?:-\d{4})?)/);
    if (zipMatch) {
      zipPart = zipMatch[1];
      console.log('📮 Found ZIP:', zipPart);
      
      // Remove ZIP from string to get state part
      const stateText = lastPart.replace(zipMatch[0], '').trim();
      console.log('🏛️ State text after removing ZIP:', stateText);
      
      // Check if it's already a 2-letter abbreviation
      if (stateText.length === 2 && /^[A-Z]{2}$/i.test(stateText)) {
        statePart = stateText.toUpperCase();
        console.log('✅ Found state abbreviation:', statePart);
      } else {
        // Try to find full state name in our mapping
        const foundState = Object.keys(stateNameToAbbrev).find(stateName => 
          stateName.toLowerCase() === stateText.toLowerCase()
        );
        
        if (foundState) {
          statePart = stateNameToAbbrev[foundState];
          console.log('✅ Converted state name to abbreviation:', stateText, '->', statePart);
        } else {
          console.log('❌ Could not find state mapping for:', stateText);
          statePart = stateText; // Use as-is if we can't map it
        }
      }
    } else {
      console.log('❌ No ZIP code found in:', lastPart);
    }
    
    const parsed = {
      address_line1: street,
      address_line2: '', // Optional second address line
      city: cityPart,
      state: statePart,
      zip_code: zipPart,
      full_address: fullAddress
    };
    
    console.log('✅ Parsed address components:', parsed);
    return parsed;
  };

  const handleAddressSelect = async (fullAddress: string) => {
    console.log('🎯 Address selected from autocomplete:', fullAddress);
    
    const parsedAddress = parseMapboxAddress(fullAddress);
    console.log('📝 Parsed address data:', parsedAddress);
    
    setSelectedAddress(fullAddress);
    setParsedAddressData(parsedAddress);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowAddressModal(false);
    setShowContactModal(true);
    
    console.log('✅ Auto-advanced to contact form with address:', fullAddress);
    console.log('🏠 Final address in state:', parsedAddress);
  };

  const pollForResults = async (requestId: string) => {
    const maxAttempts = 30;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        console.log(`🔄 Polling attempt ${i + 1}/30 for request ${requestId}`);
        const response = await fetch(`https://fwa.spry.network/api/fwa-status/${requestId}`);
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Status check response:', data);
        
        if (data.status !== 'pending') {
          console.log('✅ Got final results →', {
            qualified: data.qualified,
            network_type: data.network_type,
            request_id: data.request_id,
            source: data.source,
            status: data.status,
            qualification_status: data.qualification_status,
            raw: data
          });
          return data;
        }
      } catch (error) {
        console.error(`❌ Error polling for results (attempt ${i + 1}):`, error);
      }
    }
    
    console.log('⏰ Polling timeout after 30 seconds');
    return { status: 'timeout' };
  };

  const handleContactSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!parsedAddressData) {
      alert('Please select a valid address');
      return;
    }

    let leadId: string | null = null;

    console.log("📬 Landing form submission started");
    const formData = {
      address_line1: parsedAddressData.address_line1,
      address_line2: parsedAddressData.address_line2 || '',
      city: parsedAddressData.city,
      state: parsedAddressData.state,
      zip_code: parsedAddressData.zip_code,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim()
    };

    setIsSubmitting(true);

    try {
      // Step 1: Save lead first
      console.log("💾 Saving lead to database...");
      const { data: leadResult, error: leadError } = await supabase.functions.invoke('save-lead', {
        body: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
        },
      });

      if (leadError) {
        throw new Error(`Failed to save lead: ${leadError.message}`);
      }
      console.log("✅ Lead saved:", leadResult);
      leadId = leadResult.lead_id;

      // Step 2: Check availability with robust error handling
      console.log('📤 Submitting to FWA API...');
      console.log("📦 FWA Check Submission Payload:", {
        address: parsedAddressData,
        email: formData.email,
        usageType: "residential"
      });

      let qualified = false;
      let networkType = null;
      let errorMessage = null;
      let qualificationSource = 'fwa-api';
      let requestId = null;
      let finalResults = null;

      try {
        // Use the Supabase edge function for GIS-powered qualification
        const { data: qualificationData, error: qualificationError } = await supabase.functions.invoke('fwa-check', {
          body: {
            address_line1: parsedAddressData.address_line1,
            address_line2: parsedAddressData.address_line2 || '',
            city: parsedAddressData.city,
            state: parsedAddressData.state,
            zip_code: parsedAddressData.zip_code,
            lead_id: leadId
          }
        });

        if (qualificationError) {
          console.error('❌ Edge function error:', qualificationError);
          throw new Error('Unable to check service availability at this time.');
        }

        if (!qualificationData) {
          console.error('❌ Edge function returned no data');
          throw new Error('Service check failed.');
        }

        console.log('✅ Edge function response:', qualificationData);
        
        finalResults = qualificationData;
        qualified = qualificationData.qualified || false;
        networkType = qualificationData.network_type;
        qualificationSource = qualificationData.source || 'gis';

        setQualificationResult({
          qualified: qualified,
          source: qualificationSource,
          network_type: networkType,
          minsignal: qualificationData.minsignal
        });

      } catch (fwaError) {
        console.error('🔥 FWA check error:', fwaError);
        errorMessage = fwaError.message;
        // Still show results with error state
        setQualificationResult({
          qualified: false,
          network_type: null,
          error: true,
          message: 'Unable to check availability at this time'
        });
      }

      // Step 3: Update lead with qualification results (success or failure)
      if (leadId) {
        try {
          console.log("📝 Updating lead with qualification results...");
          const { error: updateError } = await supabase.functions.invoke('update-lead', {
            body: {
              lead_id: leadId,
              qualified,
              network_type: networkType,
              error_message: errorMessage,
              qualification_source: qualificationSource,
              request_id: requestId
            },
          });
          
          if (updateError) {
            throw updateError;
          }
          console.log("✅ Lead qualification status updated");
        } catch (updateError) {
          console.error('🔥 Failed to update lead qualification:', updateError);
        }
      }

      // Log final saved state
      console.log("🧠 Final saved onboarding state:", {
        qualified: qualified,
        address: parsedAddressData,
        source: qualificationSource,
        network_type: networkType
      });

      setShowContactModal(false);
      
      // Save user data for later use
      saveUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: {
          addressLine1: formData.address_line1,
          addressLine2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip_code
        }
      });

      // Redirect to address-success page if qualified, otherwise show results modal
      if (qualified) {
        console.log("✅ User qualified - redirecting to address-success page");
        // Save qualification data for AddressSuccess page
        sessionStorage.setItem('qualification_result', JSON.stringify({
          qualified: true,
          minsignal: finalResults?.minsignal,
          network_type: finalResults?.network_type
        }));
        navigate('/address-success');
      } else {
        setShowResultsModal(true);
      }
      
      setFirstName('');
      setLastName('');
      setEmail('');

    } catch (error) {
      console.error('❌ API Error:', error);
      alert('Something went wrong checking availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseResults = () => {
    setShowResultsModal(false);
    setSelectedAddress('');
    setParsedAddressData(null);
    setQualificationResult(null);
  };

  const handleGetStarted = () => {
    setShowResultsModal(false);
    setShowCheckoutModal(true);
  };

  const renderModal3D = (children: React.ReactNode, modalHeight = '500px') => (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div 
        className="relative rounded-xl overflow-hidden modal-container"
        style={{
          width: '480px',
          height: modalHeight,
          backgroundColor: '#0047AB',
          transform: 'none',
          borderRadius: '12px',
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.6),
            0 10px 20px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 71, 171, 0.15)
          `,
          filter: 'drop-shadow(0 8px 16px rgba(0, 71, 171, 0.2))'
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <>
      <section className="relative w-full h-[80vh] overflow-hidden">
        <img 
          id="hero-image" 
          src="/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png" 
          alt="People enjoying reliable internet at home" 
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1500 opacity-60" 
          style={{ transition: 'opacity 1.5s ease-in-out, filter 1.5s ease-in-out' }}
        />
        
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-6">
          <h1 
            className={`text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg transition-opacity duration-500 leading-tight max-w-4xl ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentHook || "Finally. Internet Without the BS."}
          </h1>

          <p className="text-xl text-white mt-2 drop-shadow-lg leading-relaxed mb-2">
            No contracts. No hidden fees. No more getting screwed by big cable.
          </p>
          
          <p className="text-base text-white/90 drop-shadow-lg leading-relaxed">
            Join 12,847 Americans who ditched their greedy ISP this month.
          </p>

          <button
            onClick={() => setShowAddressModal(true)}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-8 py-4 rounded-full text-base shadow-lg transition-all duration-200 mt-4 min-w-[220px]"
          >
            Check Availability
          </button>
        </div>
      </section>

      {showAddressModal && renderModal3D(
        <>
          <button
            onClick={() => setShowAddressModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
          >
            ×
          </button>

          <div className="px-6 py-6 h-full flex flex-col justify-center text-center relative">
            {/* Enhanced SpryFi Branding */}
            <div className="text-center mb-6">
              <div className="text-white text-3xl font-bold mb-2">
                SpryFi
              </div>
              <div className="text-blue-100 text-sm font-medium">
                Internet that just works
              </div>
            </div>

            <h2 className="text-white text-xl font-bold mb-2 leading-tight">
              See if our award-winning internet has arrived<br />
              in your neighborhood
            </h2>

            <p className="text-blue-100 text-base mb-6">
              Simple internet, no runaround
            </p>

            <div className="relative z-40 mb-4" style={{ overflow: 'visible' }}>
              <SimpleAddressInput
                key={showAddressModal ? 'fresh' : 'stale'}
                onAddressSelect={(address) => handleAddressSelect(address)}
                placeholder="Enter your street address"
              />
            </div>

            <p className="text-blue-100 text-sm">
              Results in 10 seconds
            </p>
          </div>
        </>
      )}

      {showContactModal && renderModal3D(
        <>
          <button
            onClick={() => setShowContactModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
          >
            ×
          </button>

          <div className="px-6 py-6 h-full flex flex-col justify-center text-center relative">
            {/* Enhanced SpryFi Branding */}
            <div className="text-center mb-4">
              <div className="text-white text-3xl font-bold mb-2">
                SpryFi
              </div>
              <div className="text-blue-100 text-sm font-medium">
                Internet that just works
              </div>
            </div>

            {selectedAddress && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                <p className="text-sm text-blue-600 font-medium mb-1">Selected Address:</p>
                <p className="text-blue-800 font-semibold text-sm">{selectedAddress}</p>
              </div>
            )}

            <h2 className="text-white text-xl font-bold mb-2 leading-tight">
              Let's get your results
            </h2>

            <p className="text-blue-100 text-sm mb-6">
              We'll check availability and show your results immediately
            </p>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <button
              onClick={handleContactSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Checking availability...' : 'Check my address'}
            </button>
          </div>
        </>
      )}

      {showResultsModal && renderModal3D(
        <>
          <button
            onClick={handleCloseResults}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
          >
            ×
          </button>

          <div 
            className="absolute bottom-3 left-3 text-xs text-blue-200 opacity-70"
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.6)'
            }}
          >
            gis-api
          </div>

          <div className="px-6 py-6 h-full flex flex-col justify-center text-center relative">
            {/* Enhanced SpryFi Branding */}
            <div className="text-center mb-4">
              <div className="text-white text-3xl font-bold mb-2">
                SpryFi
              </div>
              <div className="text-blue-100 text-sm font-medium">
                Internet that just works
              </div>
            </div>

            {qualificationResult?.qualified ? (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg relative">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.65-4.35-1.65-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.86 9.14 5 13z"/>
                    </svg>
                    
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h2 className="text-white text-xl font-bold mb-2 leading-tight">
                  Great news! SpryFi is available
                </h2>
                <p className="text-blue-100 text-sm mb-6">
                   We found excellent coverage at your address
                 </p>
                {qualificationResult?.minsignal !== undefined && typeof qualificationResult.minsignal === 'number' && (
                  <div className="text-xs text-gray-300 mb-4">
                    Signal Strength: {qualificationResult.minsignal}
                  </div>
                )}
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">📍</div>
                <h2 className="text-white text-xl font-bold mb-2 leading-tight">
                  Not quite there yet
                </h2>
                <p className="text-blue-100 text-sm mb-6">
                  We're working to expand coverage to your area. We'll notify you as soon as we're available.
                </p>
                <button
                  onClick={handleCloseResults}
                  className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors"
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </>
      )}

      <CheckoutModal 
        isOpen={showCheckoutModal} 
        onClose={() => setShowCheckoutModal(false)}
        qualificationData={{
          qualified: qualificationResult?.qualified || false,
          address: parsedAddressData,
          contact: { firstName, lastName, email, phone: '' },
          qualificationResult
        }}
      />
    </>
  );
};
