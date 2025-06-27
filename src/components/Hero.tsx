
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
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
  // Call all hooks at the top level - this is critical
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
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

  // Clear address input and reset state when modal opens
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
    // Core home internet usage: work, streaming, gaming
    const heroImages = [
      "/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png", // gaming at home
      "/lovable-uploads/8c1667e5-2814-4a78-abe6-4469911e4e24.png", // dad working from home with child
      "/lovable-uploads/c9f4e146-8c48-4411-8b5f-0c9ceb66fc4e.png", // family streaming together
      "/lovable-uploads/3ce628a3-58d7-4f62-972d-82411046939a.png", // child using tablet with headphones
      "/lovable-uploads/cd5c8c35-7747-4f47-9491-e9f1d0bc53df.png", // mobile gaming
      "/lovable-uploads/4d57e83f-db1b-430a-8b7e-3be3e4f0f7b8.png", // family with devices on couch
      "/lovable-uploads/e5884a69-1d16-4c82-9387-c9bf9c831e61.png", // family working/studying at kitchen table
    ];

    let currentImage = 0;
    let intervalId: NodeJS.Timeout;

    // Add a small delay to ensure DOM is ready
    const startRotation = () => {
      intervalId = setInterval(() => {
        currentImage = (currentImage + 1) % heroImages.length;
        const heroImg = document.getElementById("hero-image") as HTMLImageElement;
        if (heroImg) {
          // Start blur and fade out
          heroImg.style.filter = "blur(4px)";
          heroImg.classList.add("opacity-0");

          setTimeout(() => {
            heroImg.src = heroImages[currentImage];
            heroImg.classList.remove("opacity-0");
            heroImg.style.filter = "blur(0px)";
          }, 1500); // 1.5 second transition
        }
      }, 5000); // Rotate every 5 seconds
    };

    // Start rotation after a brief delay
    const timeoutId = setTimeout(startRotation, 100);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty dependency array

  // Fixed address parsing function
  const parseMapboxAddress = (fullAddress: string): ParsedAddress => {
    console.log('🔍 Parsing Mapbox address:', fullAddress);
    
    // "1349 Rich Lane, Buda, Texas 78610, United States"
    const parts = fullAddress.split(', ');
    console.log('📝 Address parts:', parts);
    
    const stateZipPart = parts[2] || '';
    const stateZipMatch = stateZipPart.match(/^(\w+)\s+(\d{5})$/);
    
    const state = stateZipMatch ? stateZipMatch[1] : '';
    const zipCode = stateZipMatch ? stateZipMatch[2] : '';
    
    // Convert state name to abbreviation
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

  // Fixed address selection handler
  const handleAddressSelect = async (fullAddress: string) => {
    console.log('🎯 Address selected from autocomplete:', fullAddress);
    
    // 1. Parse the address into components
    const parsedAddress = parseMapboxAddress(fullAddress);
    console.log('📝 Parsed address data:', parsedAddress);
    
    // 2. Store both the full address string and parsed components
    setSelectedAddress(fullAddress); // This is the full Mapbox place_name
    setParsedAddressData(parsedAddress);
    
    // 3. Wait 1.5 seconds to show the full address before advancing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 4. Automatically transition to contact form - smooth flow!
    setShowAddressModal(false);
    setShowContactModal(true);
    
    console.log('✅ Auto-advanced to contact form with address:', fullAddress);
  };

  // Poll for API results when status is pending
  const pollForResults = async (requestId: string) => {
    const maxAttempts = 30; // Poll for up to 30 seconds
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
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
          return data; // Got final results
        }
      } catch (error) {
        console.error(`❌ Error polling for results (attempt ${i + 1}):`, error);
      }
    }
    
    console.log('⏰ Polling timeout after 30 seconds');
    return { status: 'timeout' }; // Timeout after 30 seconds
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
      
      // Use HTTPS endpoint
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

      // Check if we got a pending status and need to poll
      if (data.status === 'pending' && data.request_id) {
        console.log('🔄 Status is pending, starting polling...');
        
        // Poll for final results
        const finalData = await pollForResults(data.request_id);
        
        if (finalData.status === 'timeout') {
          alert('Request timed out. Please try again.');
          return;
        }
        
        // Use the final results
        setQualificationResult({
          qualified: finalData.qualified || false,
          source: finalData.source || 'unknown',
          network_type: finalData.network_type
        });
      } else {
        // Set qualification results based on immediate API response
        setQualificationResult({
          qualified: data.qualified || false,
          source: data.source || 'unknown',
          network_type: data.network_type
        });
      }

      // Close contact modal and show results
      setShowContactModal(false);
      setShowResultsModal(true);
      
      // Reset form
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

  const renderModal3D = (children: React.ReactNode) => (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div 
        className="relative rounded-xl overflow-hidden"
        style={{
          width: '480px',
          height: showContactModal ? '450px' : showResultsModal ? '400px' : '320px',
          backgroundColor: '#0047AB',
          transform: 'perspective(1000px) rotateY(-5deg)',
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.6),
            0 12px 24px rgba(0, 0, 0, 0.4),
            0 6px 12px rgba(0, 0, 0, 0.3)
          `,
          filter: 'drop-shadow(0 0 20px rgba(0, 71, 171, 0.3))',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Enhanced 3D depth layer */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: '#003a94',
            transform: 'translateZ(-8px)',
            zIndex: -1
          }}
        />
        
        {children}
      </div>
    </div>
  );

  return (
    <>
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image with blur and fade transitions */}
        <img 
          id="hero-image" 
          src="/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png" 
          alt="People enjoying reliable internet at home" 
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1500 opacity-60" 
          style={{ transition: 'opacity 1.5s ease-in-out, filter 1.5s ease-in-out' }}
        />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Overlay Content */}
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

      {/* Address Modal */}
      {showAddressModal && renderModal3D(
        <>
          {/* Close X with enhanced hover effect */}
          <button
            onClick={() => setShowAddressModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            ×
          </button>

          {/* Content with enhanced depth */}
          <div 
            className="px-6 py-6 h-full flex flex-col justify-center text-center relative"
            style={{
              transform: 'translateZ(2px)'
            }}
          >
            {/* Logo with glow effect */}
            <div 
              className="text-white text-lg font-normal mb-6"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              SpryFi
            </div>

            {/* Headline with enhanced text shadow */}
            <h2 
              className="text-white text-xl font-bold mb-2 leading-tight"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              See if our award-winning internet has arrived<br />
              in your neighborhood
            </h2>

            {/* Subheadline */}
            <p 
              className="text-blue-100 text-base mb-6"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              Simple internet, no runaround
            </p>

            {/* Address Input with enhanced 3D effect */}
            <div 
              className="relative z-40 mb-4" 
              style={{ 
                overflow: 'visible',
                transform: 'translateZ(2px)'
              }}
            >
              <SimpleAddressInput
                key={showAddressModal ? 'fresh' : 'stale'} // Force fresh component
                onAddressSelect={(address) => handleAddressSelect(address)}
                placeholder="Enter your street address"
              />
            </div>

            {/* Footer with subtle shadow */}
            <p 
              className="text-blue-100 text-sm"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
              }}
            >
              Results in 10 seconds
            </p>
          </div>
        </>
      )}

      {/* Contact Modal */}
      {showContactModal && renderModal3D(
        <>
          {/* Close X */}
          <button
            onClick={() => setShowContactModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            ×
          </button>

          {/* Content */}
          <div 
            className="px-6 py-6 h-full flex flex-col justify-center text-center relative"
            style={{
              transform: 'translateZ(2px)'
            }}
          >
            {/* Logo */}
            <div 
              className="text-white text-lg font-normal mb-4"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              SpryFi
            </div>

            {/* Improved selected address display */}
            {selectedAddress && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                <p className="text-sm text-blue-600 font-medium mb-1">Selected Address:</p>
                <p className="text-blue-800 font-semibold text-sm">{selectedAddress}</p>
              </div>
            )}

            {/* Headline */}
            <h2 
              className="text-white text-xl font-bold mb-2 leading-tight"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              Let's get your results
            </h2>

            {/* Updated Subheadline */}
            <p 
              className="text-blue-100 text-sm mb-6"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              We'll check availability and show your results immediately
            </p>

            {/* Form Inputs with increased spacing */}
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

            {/* Submit Button with updated text */}
            <button
              onClick={handleContactSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transform: 'translateZ(2px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {isSubmitting ? 'Checking availability...' : 'Check my address'}
            </button>
          </div>
        </>
      )}

      {/* Results Modal */}
      {showResultsModal && renderModal3D(
        <>
          {/* Close X */}
          <button
            onClick={handleCloseResults}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            ×
          </button>

          {/* Qualification method indicator */}
          <div 
            className="absolute bottom-3 left-3 text-xs text-blue-200 opacity-70"
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.6)'
            }}
          >
            {qualificationResult?.source === 'verizon' ? 'sapi1' : 'sapi2'}
          </div>

          {/* Content */}
          <div 
            className="px-6 py-6 h-full flex flex-col justify-center text-center relative"
            style={{
              transform: 'translateZ(2px)'
            }}
          >
            {/* Logo */}
            <div 
              className="text-white text-lg font-normal mb-4"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              SpryFi
            </div>

            {qualificationResult?.qualified ? (
              <>
                {/* Success Message */}
                <div className="text-4xl mb-4">🎉</div>
                <h2 
                  className="text-white text-xl font-bold mb-2 leading-tight"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  Great news! SpryFi is available
                </h2>
                <p 
                  className="text-blue-100 text-sm mb-6"
                  style={{
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  We found {qualificationResult.source === 'verizon' ? 'excellent' : 'good'} coverage at your address
                </p>
                <button
                  onClick={openModal}
                  className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    transform: 'translateZ(2px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                {/* Not Available Message */}
                <div className="text-4xl mb-4">📍</div>
                <h2 
                  className="text-white text-xl font-bold mb-2 leading-tight"
                  style={{
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  Not quite there yet
                </h2>
                <p 
                  className="text-blue-100 text-sm mb-6"
                  style={{
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  We're working to expand coverage to your area. We'll notify you as soon as we're available.
                </p>
                <button
                  onClick={handleCloseResults}
                  className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    transform: 'translateZ(2px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </>
      )}

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
