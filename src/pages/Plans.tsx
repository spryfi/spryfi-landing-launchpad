import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'spryfi-home',
      name: 'SpryFi Home',
      description: 'Perfect for most homes',
      price: 99.95,
      features: ['Up to 150 Mbps', 'All online activities (streaming, gaming, video calls)', 'No contracts, no hidden fees']
    },
    {
      id: 'spryfi-home-premium',
      name: 'SpryFi Home Premium',
      description: 'For power users and families',
      price: 139.95,
      features: ['Up to 300 Mbps', 'Best for heavy usage (multiple devices & power users)', 'All online activities (streaming, gaming, video calls)', 'No contracts, no hidden fees']
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* SpryFi Branding */}
          <div className="text-center mb-8">
            <div className="text-[#0047AB] text-3xl font-bold mb-2">
              SpryFi
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Internet that just works
            </div>
          </div>

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-gray-600 text-lg">
              Select the plan that best fits your needs. No contracts, no hidden fees.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid gap-6 max-w-2xl mx-auto mb-8">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card-wrapper group relative inline-block overflow-visible">
                <div className="absolute top-1 left-1 w-full h-full rounded-2xl bg-gray-50 shadow-md transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-lg"></div>
                <div
                  className={`relative cursor-pointer rounded-2xl p-6 transition-transform duration-200 ease-out bg-gradient-to-br from-blue-700 to-blue-600 text-white shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 ${
                    selectedPlan === plan.id ? 'ring-4 ring-white' : 'ring-2 ring-transparent'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm opacity-90">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold">${plan.price}</span>
                        <span className="ml-1 text-sm">/mo</span>
                      </div>
                      <p className="text-xs opacity-75 max-w-32 text-right">Amount due today will be calculated at checkout (prorated + discounted shipping)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm opacity-90">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {selectedPlan === plan.id && (
                    <div className="mt-4 text-center">
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Link to="/router-setup">
              <Button 
                className="bg-[#0047AB] hover:bg-[#0060D4] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 w-full max-w-md"
                disabled={!selectedPlan}
              >
                Continue to Router Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};