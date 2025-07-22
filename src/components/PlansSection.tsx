
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import SimpleAddressInput from '@/components/SimpleAddressInput';
import { supabase } from '@/integrations/supabase/client';
import { saveUserData } from '@/utils/userDataUtils';

interface PlansSectionProps {
  saleActive?: boolean;
}

interface ParsedAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  full_address: string;
}

export const PlansSection = ({ saleActive = false }: PlansSectionProps) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [parsedAddressData, setParsedAddressData] = useState<ParsedAddress | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      name: "SpryFi Essential",
      originalPrice: "$99.95/mo",
      salePrice: "$89.99/mo",
      price: saleActive ? "$89.99/mo" : "$99.95/mo",
      speed: "100+ Mbps",
      description: "Stream shows, browse freely",
      subtitle: "Works great for 1–2 people",
      features: ["No contracts, no credit checks"],
      popular: false,
      style: "basic",
      planType: saleActive ? "home-10" : "spryfi-home",
      planCode: saleActive ? "home-10" : "spryfi-home",
      lockedPrice: saleActive ? "$89.99/mo" : "$99.95/mo",
      isSpecialPricing: saleActive
    },
    {
      name: "SpryFi Premium",
      originalPrice: "$139.95/mo",
      salePrice: "$129.99/mo", 
      price: saleActive ? "$129.99/mo" : "$139.95/mo",
      speed: "200+ Mbps",
      description: "Perfect for families & remote work",
      subtitle: "No throttling, no limits",
      features: ["Great for streaming, Zoom, and gaming"],
      popular: true,
      style: "premium",
      planType: saleActive ? "premium-10" : "spryfi-home-premium",
      planCode: saleActive ? "premium-10" : "spryfi-home-premium",
      lockedPrice: saleActive ? "$129.99/mo" : "$139.95/mo",
      isSpecialPricing: saleActive
    }
  ];

  const included = [
    "Unlimited data",
    <span key="loyalty">
      No contracts required (save more with{' '}
      <Link 
        to="/loyalty-savings" 
        className="text-blue-600 underline hover:text-blue-800 transition-colors"
      >
        optional loyalty circle program
      </Link>
      )
    </span>,
    "WiFi 7 compatible router with AI optimization included",
    "14-day money-back guarantee"
  ];

  // Address parsing function (same as Hero)
  const parseMapboxAddress = (fullAddress: string): ParsedAddress => {
    console.log('🔍 Parsing Mapbox address:', fullAddress);
    
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

    const street = parts[0] || '';
    const cityPart = parts[parts.length - 2] || '';
    const lastPart = parts[parts.length - 1];
    
    let statePart = '';
    let zipPart = '';
    
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
    
    const zipMatch = lastPart.match(/(\d{5}(?:-\d{4})?)/);
    if (zipMatch) {
      zipPart = zipMatch[1];
      const stateText = lastPart.replace(zipMatch[0], '').trim();
      
      if (stateText.length === 2 && /^[A-Z]{2}$/i.test(stateText)) {
        statePart = stateText.toUpperCase();
      } else {
        const foundState = Object.keys(stateNameToAbbrev).find(stateName => 
          stateName.toLowerCase() === stateText.toLowerCase()
        );
        
        if (foundState) {
          statePart = stateNameToAbbrev[foundState];
        } else {
          statePart = stateText;
        }
      }
    }
    
    return {
      address_line1: street,
      address_line2: '',
      city: cityPart,
      state: statePart,
      zip_code: zipPart,
      full_address: fullAddress
    };
  };

  const handleAddressSelect = async (fullAddress: string) => {
    console.log('🎯 Address selected for plan:', selectedPlan, 'Address:', fullAddress);
    
    const parsedAddress = parseMapboxAddress(fullAddress);
    console.log('📝 Parsed address data:', parsedAddress);
    
    setSelectedAddress(fullAddress);
    setParsedAddressData(parsedAddress);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowAddressModal(false);
    setShowContactModal(true);
  };

  const handleContactSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!parsedAddressData || !selectedPlan) {
      alert('Please select a valid address and plan');
      return;
    }

    console.log("📬 Plan selection form submission started for plan:", selectedPlan);
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
      // Save lead
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
      
      const leadId = leadResult.lead_id;

      // Check qualification
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

      const qualified = qualificationData?.qualified || false;

      // Update lead with qualification results
      await supabase.functions.invoke('update-lead', {
        body: {
          lead_id: leadId,
          qualified,
          network_type: qualificationData?.network_type,
          qualification_source: qualificationData?.source || 'gis',
        },
      });

      // Save user data
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

      // Save qualification and plan data for AddressSuccess page
      sessionStorage.setItem('qualification_result', JSON.stringify({
        qualified: qualified,
        minsignal: qualificationData?.minsignal,
        network_type: qualificationData?.network_type,
        preselectedPlan: selectedPlan // Include plan selection
      }));
      
      console.log("✅ Redirecting to address-success with plan:", selectedPlan);
      navigate('/address-success');
      
    } catch (error) {
      console.error('❌ API Error:', error);
      alert('Something went wrong checking availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanClick = (planType: string) => {
    console.log('🎯 Plan clicked from landing page:', planType);
    setSelectedPlan(planType);
    setShowAddressModal(true);
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
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Pick the Plan That's Right for You.
          </h2>
          <h2 className="text-center text-xl font-medium text-gray-700 mb-8">
            Two simple plans. Both with plenty of power to make your life online a dream.
          </h2>
          
          {saleActive && (
            <div className="text-center mb-8">
              <span className="sale-badge">🔥 FLASH SALE PRICING - LOCKED FOR LIFE 🔥</span>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group w-full md:w-1/2 max-w-md ${
                  plan.style === 'basic' 
                    ? 'bg-white border border-gray-200 shadow-lg hover:shadow-gray-200/50' 
                    : 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 shadow-xl transform scale-105 hover:shadow-blue-200/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    {plan.name}
                  </h3>
                  
                  <div className={`text-lg font-semibold mb-4 ${
                    plan.style === 'basic' ? 'text-blue-600' : 'text-blue-700'
                  }`}>
                    {plan.speed}
                  </div>
                  
                  <div className="price-display mb-6">
                    {saleActive ? (
                      <>
                        <div className="original-price">{plan.originalPrice}</div>
                        <div className={`sale-price ${
                          plan.style === 'basic' ? 'text-red-600' : 'text-red-700'
                        }`}>
                          {plan.salePrice}
                        </div>
                        <div className="forever-badge">FOREVER PRICE</div>
                      </>
                    ) : (
                      <div className={`text-5xl font-bold ${
                        plan.style === 'basic' ? 'text-gray-900' : 'text-blue-700'
                      }`}>
                        {plan.price}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full mb-3 inline-block ${
                    saleActive 
                      ? 'savings-callout-sale' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {saleActive ? "Save $120/year forever!" : "Save $180/year vs. Comcast"}
                  </div>
                  
                  <div className="text-lg font-medium mb-3 text-gray-700">
                    {plan.description}
                  </div>
                  
                  <div className="text-base mb-4 text-gray-600">
                    {plan.subtitle}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4 border-t pt-3">
                    No equipment fees • No activation fees • No surprises
                  </div>
                  
                  <div className="optional-savings-hint mb-4">
                    <span className="month-to-month-badge">Month-to-month</span>
                    <a href="/loyalty-savings" className="savings-link">
                      Want to save more? <span className="underline">Join the Loyalty Circle</span> →
                    </a>
                  </div>
                  
                  <div className="mb-8 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-3 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-600">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handlePlanClick(plan.planType)}
                    className={`w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform group-hover:scale-105 ${
                      plan.style === 'basic' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25' 
                        : 'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-600/25'
                    }`}
                  >
                    Choose {plan.name.split(' ')[1]}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              All Plans Include:
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {included.map((item, index) => (
                <div key={index} className="flex items-center justify-center md:justify-start">
                  <Check className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
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
              Selected Plan: {plans.find(p => p.planType === selectedPlan)?.name || selectedPlan}
            </p>

            <div className="relative z-40 mb-4" style={{ overflow: 'visible' }}>
              <SimpleAddressInput
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
                <p className="text-sm text-blue-600 font-medium mt-2">Selected Plan:</p>
                <p className="text-blue-800 font-semibold text-sm">{plans.find(p => p.planType === selectedPlan)?.name || selectedPlan}</p>
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
              className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Checking availability...' : 'Check Availability & Continue'}
            </button>
          </div>
        </>
      )}
    </>
  );
};
