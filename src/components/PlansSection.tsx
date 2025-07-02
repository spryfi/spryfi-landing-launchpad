
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { CheckoutModal } from './checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';

export const PlansSection = () => {
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  const plans = [
    {
      name: "SpryFi Essential",
      price: "$99.95/mo",
      speed: "100+ Mbps",
      description: "Stream shows, browse freely",
      subtitle: "Works great for 1–2 people",
      features: ["No contracts, no credit checks"],
      popular: false,
      style: "basic",
      planType: "spryfi-home" // Add plan type for checkout
    },
    {
      name: "SpryFi Premium",
      price: "$139.95/mo", 
      speed: "200+ Mbps",
      description: "Perfect for families & remote work",
      subtitle: "No throttling, no limits",
      features: ["Great for streaming, Zoom, and gaming"],
      popular: true,
      style: "premium",
      planType: "spryfi-home-premium" // Add plan type for checkout
    }
  ];

  const included = [
    "Unlimited data",
    "No contracts required (save more with optional loyalty terms)", 
    "Modem included",
    "14-day money-back guarantee"
  ];

  const handlePlanClick = (planType: string) => {
    console.log('🎯 Plan clicked from landing page:', planType);
    setSelectedPlan(planType);
    openModal();
  };

  const handleModalClose = () => {
    setSelectedPlan(null);
    closeModal();
  };

  return (
    <>
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Pick the Plan That's Right for You.
          </h2>
          <h2 className="text-center text-xl font-medium text-gray-700 mb-16">
            Two simple plans. Both with plenty of power to make your life online a dream.
          </h2>
          
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
                  
                  <div className={`text-5xl font-bold mb-6 ${
                    plan.style === 'basic' ? 'text-gray-900' : 'text-blue-700'
                  }`}>
                    {plan.price}
                  </div>
                  
                  <div className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                    Save $180/year vs. Comcast
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

      <CheckoutModal 
        isOpen={isOpen} 
        onClose={handleModalClose} 
        preselectedPlan={selectedPlan}
      />
    </>
  );
};
