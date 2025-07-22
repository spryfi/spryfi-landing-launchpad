import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AddressSuccess() {
  const navigate = useNavigate();
  const [minsignal, setMinsignal] = useState<number | null>(null);
  const [preselectedPlan, setPreselectedPlan] = useState<string | null>(null);

  useEffect(() => {
    // Get qualification data from sessionStorage
    const qualificationData = sessionStorage.getItem('qualification_result');
    if (qualificationData) {
      try {
        const data = JSON.parse(qualificationData);
        if (data.qualified && typeof data.minsignal === 'number') {
          setMinsignal(data.minsignal);
        }
        if (data.preselectedPlan) {
          setPreselectedPlan(data.preselectedPlan);
          console.log('🎯 Preselected plan loaded:', data.preselectedPlan);
        }
      } catch (error) {
        console.error('Error parsing qualification data:', error);
      }
    }
  }, []);

  const handleChoosePlan = () => {
    if (preselectedPlan) {
      // If we have a preselected plan, go straight to checkout with that plan
      console.log('🚀 Navigating to checkout with preselected plan:', preselectedPlan);
      navigate('/checkout', { state: { preselectedPlan } });
    } else {
      // Fallback to plans page if no preselected plan
      navigate('/plans');
    }
  };

  const getPlanDisplayInfo = (planCode: string) => {
    const planInfo = {
      'home-10': { name: 'SpryFi Essential', price: '$89.99/mo', originalPrice: '$99.95/mo' },
      'premium-10': { name: 'SpryFi Premium', price: '$129.99/mo', originalPrice: '$139.95/mo' },
      'spryfi-home': { name: 'SpryFi Essential', price: '$99.95/mo', originalPrice: null },
      'spryfi-home-premium': { name: 'SpryFi Premium', price: '$139.95/mo', originalPrice: null }
    };
    return planInfo[planCode] || { name: 'SpryFi Plan', price: 'Contact us', originalPrice: null };
  };

  const planInfo = preselectedPlan ? getPlanDisplayInfo(preselectedPlan) : null;
  const isSpecialPricing = preselectedPlan?.includes('-10');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-blue-500 text-white">
      <h1 className="text-3xl font-bold mb-4 text-white">
        Welcome to SpryFi Home!
      </h1>
      <p className="text-lg text-white mb-4">
        Great news—your address is covered by SpryFi Home.
      </p>
      
      {planInfo && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 text-center border border-white/20">
          <h3 className="text-xl font-semibold mb-2">Your Selected Plan</h3>
          <div className="text-2xl font-bold text-yellow-300">{planInfo.name}</div>
          <div className="text-lg">
            {isSpecialPricing && planInfo.originalPrice && (
              <span className="line-through text-gray-300 mr-2">{planInfo.originalPrice}</span>
            )}
            <span className="font-bold">{planInfo.price}</span>
          </div>
          {isSpecialPricing && (
            <div className="text-sm text-yellow-200 font-semibold mt-2">
              🔥 LOCKED FOR LIFE - $10 OFF FOREVER! 🔥
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={handleChoosePlan}
        className="mt-4 px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
      >
        {preselectedPlan ? 'Continue to Checkout' : 'Choose Your Plan'}
      </button>
      
      {minsignal !== null && (
        <div className="absolute bottom-4 left-4">
          <p className="text-xs text-gray-400">
            SS{minsignal}
          </p>
        </div>
      )}
    </div>
  );
}