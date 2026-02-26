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
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Plans starting at <span className="font-semibold text-gray-900">$89/mo</span>.
              No contracts, no hidden fees, no data caps.
            </p>
          </div>

          {/* Value props */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              { icon: Wifi, title: 'Unlimited Internet', desc: 'No data caps, ever' },
              { icon: Shield, title: 'No Contracts', desc: 'Cancel anytime' },
              { icon: CreditCard, title: 'No Hidden Fees', desc: 'The price you see is it' },
              { icon: ArrowRight, title: 'Free Router', desc: 'Included with every plan' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-100 text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-blue-50 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#0047AB]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => setShowAddressModal(true)}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#0047AB] hover:bg-[#0060D4] text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Check Availability
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Enter your address to see exact pricing for your area.
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
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
            <p className="text-sm text-gray-400 mt-4">
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
