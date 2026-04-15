import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Wifi, Shield, CreditCard, ArrowRight } from 'lucide-react';
import SimpleAddressInput from '@/components/SimpleAddressInput';
import { parseMapboxAddress } from '@/components/Hero';
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

export const PlansSection = () => {
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [parsedAddressData, setParsedAddressData] = useState<ParsedAddress | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const { error: leadError } = await supabase.functions.invoke('save-lead', {
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
      }));

      setShowContactModal(false);
      navigate(coverageData.redirect || '/not-serviceable');
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong checking availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModal = (children: React.ReactNode) => (
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
      <section id="plans" className="py-24 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-50 text-[#0047AB] text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6 border border-blue-100">
              Two Simple Plans
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Let Us Connect Your Family
              <br />
              <span className="text-[#0047AB]">To the Best Internet Available</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              No contracts, no hidden fees, no data caps. Just pick your plan.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-14 max-w-3xl mx-auto">
            {/* SpryFi Home */}
            <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-gray-100 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">SpryFi Home</h3>
                <p className="text-gray-500 text-sm">Perfect for 2–3 people</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-gray-900">$89</span>
                <span className="text-gray-500 text-lg">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited data', 'Free Dragon modem', 'Up to 128 devices', 'Live & chat support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all"
              >
                Get Started
              </button>
            </div>

            {/* SpryFi Family */}
            <div className="bg-[#0047AB] rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">SpryFi Family</h3>
                <p className="text-blue-200 text-sm">For heavy users & large households</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-white">$109</span>
                <span className="text-blue-200 text-lg">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited data', 'Free Dragon modem', 'Up to 128 devices', 'Priority live & chat support', 'Ideal for gaming & streaming'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-blue-100">
                    <Check className="w-4 h-4 text-green-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full py-3 bg-white hover:bg-gray-50 text-[#0047AB] font-bold rounded-xl transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-4">
              {[
                'Unlimited data',
                'Free WiFi router',
                '14-day money-back guarantee',
                'No equipment fees',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Month-to-month, cancel anytime.{' '}
              <Link to="/loyalty-savings" className="text-blue-600 hover:text-blue-800 underline transition-colors">
                Save more with Loyalty Circle
              </Link>
            </p>
          </div>
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
              <h2 className="text-white text-xl font-bold mb-2">
                Let's check your address
              </h2>
              <p className="text-blue-200/60 text-xs mb-8">
                We'll find the best plan for your location
              </p>
              <div className="relative z-40 mb-4" style={{ overflow: 'visible' }}>
                <SimpleAddressInput
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter your street address"
                />
              </div>
            </div>
          </>
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
                  <p className="text-xs text-blue-200 mb-0.5">Address</p>
                  <p className="text-white font-medium text-sm">{selectedAddress}</p>
                </div>
              )}

              <h2 className="text-white text-lg font-bold mb-1">Almost there</h2>
              <p className="text-blue-200 text-sm mb-6">
                Enter your info and we'll check availability instantly
              </p>

              <div className="space-y-3 mb-6">
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-sm placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-sm placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-sm placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
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
                    Checking…
                  </span>
                ) : (
                  'Check Availability'
                )}
              </button>
            </div>
          </>
        )}
    </>
  );
};
