
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PricingModal } from '@/components/PricingModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';
import SimpleAddressInput from '@/components/SimpleAddressInput';

interface ParsedAddress {
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  full_address: string;
}

export const Hero = () => {
  const { currentHook, isVisible } = useRotatingHook();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [parsedAddressData, setParsedAddressData] = useState<ParsedAddress | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qualificationResult, setQualificationResult] = useState<{
    qualified: boolean;
    source: string;
    network_type?: string;
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
    
    const parts = fullAddress.split(', ');
    console.log('📝 Address parts:', parts);
    
    const stateZipPart = parts[2] || '';
    const stateZipMatch = stateZipPart.match(/^(\w+)\s+(\d{5})$/);
    
    const state = stateZipMatch ? stateZipMatch[1] : '';
    const zipCode = stateZipMatch ? stateZipMatch[2] : '';
    
    const stateMap: { [key: string]: string } = {
      'Texas': 'TX',
      'California': 'CA', 
      'Florida': 'FL',
      'New York': 'NY',
      'Illinois': 'IL',
      'Pennsylvania': 'PA',
      'Ohio': 'OH',
      'Georgia': 'GA',
      'North Carolina': 'NC',
      'Michigan': 'MI'
    };
    
    const stateAbbr = stateMap[state] || state;
    
    const parsed = {
      address_line1: parts[0] || '',
      city: parts[1] || '',
      state: stateAbbr,
      zip_code: zipCode,
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
          console.log('✅ Got final results:', data);
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

    setIsSubmitting(true);

    try {
      console.log('📤 Submitting to HTTPS API...');
      
      const response = await fetch('https://fwa.spry.network/api/fwa-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address_line1: parsedAddressData.address_line1,
          city: parsedAddressData.city,
          state: parsedAddressData.state,
          zip_code: parsedAddressData.zip_code,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      let finalResults = data;
      let qualificationSource = 'verizon';

      if (data.status === 'pending' && data.request_id) {
        console.log('🔄 Status is pending, starting polling...');
        
        const polledData = await pollForResults(data.request_id);
        
        if (polledData.status === 'timeout') {
          alert('Request timed out. Please try again.');
          return;
        }
        
        finalResults = polledData;
      }

      if (finalResults.source) {
        qualificationSource = finalResults.source;
      }

      setQualificationResult({
        qualified: finalResults.qualified || false,
        source: qualificationSource,
        network_type: finalResults.network_type
      });

      setShowContactModal(false);
      setShowResultsModal(true);
      
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
    setShowPricingModal(true);
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
            {currentHook || "Finally. Internet that doesn't hate you."}
          </h1>

          <p className="text-base text-white mt-2 drop-shadow-lg leading-relaxed">
            Takes just 30 seconds.
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
            {qualificationResult?.source === 'verizon' ? 'sapi1' : 'sapi2'}
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
                  We found {qualificationResult.source === 'verizon' ? 'excellent' : 'good'} coverage at your address
                </p>
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

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
    </>
  );
};
