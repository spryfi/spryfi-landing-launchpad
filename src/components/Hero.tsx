import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const parseMapboxAddress = (fullAddress: string): ParsedAddress => {
  const parts = fullAddress.split(',').map(p => p.trim()).filter(p => p !== 'United States');
  if (parts.length < 3) {
    return { address_line1: fullAddress, city: '', state: '', zip_code: '', full_address: fullAddress };
  }
  const street = parts[0] || '';
  const cityPart = parts[parts.length - 2] || '';
  const lastPart = parts[parts.length - 1];
  const stateMap: Record<string, string> = {
    Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',Colorado:'CO',
    Connecticut:'CT',Delaware:'DE',Florida:'FL',Georgia:'GA',Hawaii:'HI',Idaho:'ID',
    Illinois:'IL',Indiana:'IN',Iowa:'IA',Kansas:'KS',Kentucky:'KY',Louisiana:'LA',
    Maine:'ME',Maryland:'MD',Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',
    Mississippi:'MS',Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV',
    'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
    'North Carolina':'NC','North Dakota':'ND',Ohio:'OH',Oklahoma:'OK',Oregon:'OR',
    Pennsylvania:'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',
    Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',Virginia:'VA',Washington:'WA',
    'West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY',
  };
  let statePart = '';
  let zipPart = '';
  const zipMatch = lastPart.match(/(\d{5}(?:-\d{4})?)/);
  if (zipMatch) {
    zipPart = zipMatch[1];
    const stateText = lastPart.replace(zipMatch[0], '').trim();
    if (/^[A-Z]{2}$/i.test(stateText)) {
      statePart = stateText.toUpperCase();
    } else {
      const found = Object.keys(stateMap).find(s => s.toLowerCase() === stateText.toLowerCase());
      statePart = found ? stateMap[found] : stateText;
    }
  }
  return { address_line1: street, address_line2: '', city: cityPart, state: statePart, zip_code: zipPart, full_address: fullAddress };
};

export { parseMapboxAddress };

export const Hero = () => {
  const { currentHook, isVisible } = useRotatingHook();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [parsedAddressData, setParsedAddressData] = useState<ParsedAddress | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (showAddressModal) {
      setSelectedAddress('');
      setParsedAddressData(null);
      setShowContactModal(false);
    }
  }, [showAddressModal]);

  // Listen for nav "Check Availability" clicks
  React.useEffect(() => {
    const handler = () => setShowAddressModal(true);
    window.addEventListener('open-address-modal', handler);
    return () => window.removeEventListener('open-address-modal', handler);
  }, []);

  // Hero image rotation
  React.useEffect(() => {
    const heroImages = [
      '/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png',
      '/lovable-uploads/8c1667e5-2814-4a78-abe6-4469911e4e24.png',
      '/lovable-uploads/c9f4e146-8c48-4411-8b5f-0c9ceb66fc4e.png',
      '/lovable-uploads/3ce628a3-58d7-4f62-972d-82411046939a.png',
      '/lovable-uploads/cd5c8c35-7747-4f47-9491-e9f1d0bc53df.png',
      '/lovable-uploads/4d57e83f-db1b-430a-8b7e-3be3e4f0f7b8.png',
      '/lovable-uploads/e5884a69-1d16-4c82-9387-c9bf9c831e61.png',
    ];
    let idx = 0;
    let intervalId: NodeJS.Timeout;
    const start = () => {
      intervalId = setInterval(() => {
        idx = (idx + 1) % heroImages.length;
        const img = document.getElementById('hero-image') as HTMLImageElement;
        if (img) {
          img.style.filter = 'blur(4px)';
          img.classList.add('opacity-0');
          setTimeout(() => {
            img.src = heroImages[idx];
            img.classList.remove('opacity-0');
            img.style.filter = 'blur(0px)';
          }, 1500);
        }
      }, 5000);
    };
    const tid = setTimeout(start, 100);
    return () => { clearTimeout(tid); if (intervalId) clearInterval(intervalId); };
  }, []);

  const handleAddressSelect = async (fullAddress: string) => {
    const parsed = parseMapboxAddress(fullAddress);
    setSelectedAddress(fullAddress);
    setParsedAddressData(parsed);
    await new Promise(r => setTimeout(r, 1200));
    setShowAddressModal(false);
    setShowContactModal(true);
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

    const formData = {
      address_line1: parsedAddressData.address_line1,
      address_line2: parsedAddressData.address_line2 || '',
      city: parsedAddressData.city,
      state: parsedAddressData.state,
      zip_code: parsedAddressData.zip_code,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    };

    setIsSubmitting(true);

    try {
      // 1. Save lead
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
      if (leadError) throw new Error(`Failed to save lead: ${leadError.message}`);

      // 2. Call coverage API (SpryFi spatial first, Verizon fallback inside API)
      const coverageRes = await fetch('https://coverage.spry.network/api/check-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_line1: formData.address_line1,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
        }),
      });
      if (!coverageRes.ok) throw new Error(`Coverage API error: ${coverageRes.status}`);
      const coverageData = await coverageRes.json();

      // 3. Save user data for downstream pages
      saveUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: {
          addressLine1: formData.address_line1,
          addressLine2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip_code,
        },
      });

      // 4. Persist coverage result for destination page
      sessionStorage.setItem('coverage_result', JSON.stringify({
        serviceable: coverageData.serviceable,
        provider: coverageData.provider,
        address: {
          addressLine1: formData.address_line1,
          addressLine2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip_code,
        },
        contact: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
        leadId: leadResult?.id || null,
      }));

      // 5. Redirect based on provider
      setShowContactModal(false);
      navigate(coverageData.redirect || '/not-serviceable');
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong checking availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModal = (children: React.ReactNode, height = '500px') => (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="relative rounded-xl overflow-hidden w-[90vw] max-w-[480px]"
        style={{
          minHeight: height,
          backgroundColor: '#0047AB',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.3)',
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
        <img
          id="hero-image"
          src="/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png"
          alt="People enjoying reliable internet at home"
          className="absolute inset-0 w-full h-full object-cover transition-all opacity-60"
          style={{ transition: 'opacity 1.5s ease-in-out, filter 1.5s ease-in-out' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

        <div className="relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium tracking-wide text-white/90">
              No contracts &bull; No hidden fees &bull; No data caps
            </span>
          </div>

          <h1
            className={`text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg transition-opacity duration-700 leading-[1.1] tracking-tight ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentHook || 'Finally. Internet Without the BS.'}
          </h1>

          <p className="text-lg md:text-xl text-white/90 drop-shadow-md leading-relaxed max-w-2xl mb-8">
            High-speed home internet delivered to your door. Plug it in, connect,
            and enjoy — it's that simple.
          </p>

          <button
            onClick={() => setShowAddressModal(true)}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Check Availability
          </button>

          <p className="mt-4 text-sm text-white/60">
            Takes 10 seconds &middot; No credit check required
          </p>
        </div>
      </section>

      {/* ─── Address Modal ─── */}
      {showAddressModal &&
        renderModal(
          <>
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light z-10 transition-colors w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <div className="px-8 py-10 flex flex-col justify-center text-center">
              <div className="mb-8">
                <div className="text-white text-3xl font-bold tracking-tight">SpryFi</div>
                <div className="text-blue-200 text-sm font-medium mt-1">Internet that just works</div>
              </div>
              <h2 className="text-white text-xl font-bold mb-2 leading-snug">
                Let's see if SpryFi has reached<br />your neighborhood
              </h2>
              <p className="text-blue-200 text-sm mb-8">Enter your address and we'll check instantly</p>
              <div className="relative z-40 mb-4" style={{ overflow: 'visible' }}>
                <SimpleAddressInput
                  key={showAddressModal ? 'fresh' : 'stale'}
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter your street address"
                />
              </div>
              <p className="text-blue-200/60 text-xs mt-2">
                We'll never share your information
              </p>
            </div>
          </>,
          'auto',
        )}

      {/* ─── Contact Modal ─── */}
      {showContactModal &&
        renderModal(
          <>
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light z-10 transition-colors w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <div className="px-8 py-10 flex flex-col justify-center text-center">
              <div className="mb-6">
                <div className="text-white text-3xl font-bold tracking-tight">SpryFi</div>
                <div className="text-blue-200 text-sm font-medium mt-1">Internet that just works</div>
              </div>

              {selectedAddress && (
                <div className="mb-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-left">
                  <p className="text-xs text-blue-200 mb-0.5">Selected address</p>
                  <p className="text-white font-medium text-sm">{selectedAddress}</p>
                </div>
              )}

              <h2 className="text-white text-lg font-bold mb-1 leading-snug">Almost there</h2>
              <p className="text-blue-200 text-sm mb-6">
                Enter your info and we'll check availability instantly
              </p>

              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-sm placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-sm placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-sm placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>

              <button
                onClick={handleContactSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-white hover:bg-gray-50 text-[#0047AB] font-bold text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Checking availability…
                  </span>
                ) : (
                  'Check My Address'
                )}
              </button>
              <p className="text-blue-200/50 text-xs mt-3">
                We'll never spam you or share your info
              </p>
            </div>
          </>,
          'auto',
        )}
    </>
  );
};
