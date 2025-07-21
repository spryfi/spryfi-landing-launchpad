
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface PlanSelectionProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onPlanSelected?: (planType: string) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ state, updateState, onPlanSelected }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(state.preselectedPlan || null);
  const [loading, setLoading] = useState(false);

  // Auto-select preselected plan on component mount
  useEffect(() => {
    if (state.preselectedPlan && !selectedPlan) {
      setSelectedPlan(state.preselectedPlan);
    }
  }, [state.preselectedPlan, selectedPlan]);

  // DEBUG LOGGING
  console.log('🔍 PLAN SELECTION DEBUG:', {
    componentName: 'PlanSelection',
    state: state,
    planSelected: state?.planSelected,
    selectedPlan: selectedPlan
  });

  const handlePlanSelect = (planType: string) => {
    console.log('🎯 PLAN CLICKED:', planType);
    console.log('🎯 BEFORE STATE UPDATE:', { selectedPlan, currentStep: state.step });
    
    setSelectedPlan(planType);
    console.log('Selected plan:', planType);
    
    // Check if state actually updated
    setTimeout(() => {
      console.log('🎯 STATE CHECK AFTER TIMEOUT:', { selectedPlan, planType });
    }, 100);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      return;
    }
    
    console.log('🚀 PLAN CONTINUE CLICKED:', selectedPlan);
    console.log('🚀 CURRENT STATE BEFORE CONTINUE:', state);
    
    setLoading(true);
    
    try {
      // Save plan selection to database with special pricing logic
      const getPlanData = (planType: string) => {
        switch (planType) {
          case 'home-10':
            return {
              plan_selected: 'SpryFi Home (Special-10)',
              plan_code: 'home-10',
              plan_price: 89.95,
              plan_speed: '100+ Mbps',
              special_pricing: true,
              locked_price: '$89.95/mo',
              pricing_note: 'LOCKED FOR LIFE - Special $10 off forever'
            };
          case 'premium-10':
            return {
              plan_selected: 'SpryFi Premium (Special-10)',
              plan_code: 'premium-10',
              plan_price: 129.95,
              plan_speed: '200+ Mbps',
              special_pricing: true,
              locked_price: '$129.95/mo',
              pricing_note: 'LOCKED FOR LIFE - Special $10 off forever'
            };
          case 'spryfi-home':
            return {
              plan_selected: 'SpryFi Home',
              plan_code: 'spryfi-home',
              plan_price: 99.95,
              plan_speed: '100+ Mbps',
              special_pricing: false,
              locked_price: '$99.95/mo',
              pricing_note: 'Standard pricing'
            };
          case 'spryfi-home-premium':
            return {
              plan_selected: 'SpryFi Home Premium',
              plan_code: 'spryfi-home-premium',
              plan_price: 139.95,
              plan_speed: '200+ Mbps',
              special_pricing: false,
              locked_price: '$139.95/mo',
              pricing_note: 'Standard pricing'
            };
          default:
            return {
              plan_selected: 'SpryFi Home',
              plan_code: 'spryfi-home',
              plan_price: 99.95,
              plan_speed: '100+ Mbps',
              special_pricing: false,
              locked_price: '$99.95/mo',
              pricing_note: 'Standard pricing'
            };
        }
      };

      const planData = getPlanData(selectedPlan);

      // Update leads_fresh with selected plan
      await supabase
        .from('leads_fresh')
        .update({
          status: 'plan_selected',
          // Add any plan-specific fields here if needed
        })
        .eq('id', state.leadId);

      console.log('✅ Plan saved successfully:', planData);

      // CRITICAL: Use the callback to navigate to WiFi setup
      console.log('🚀 Calling onPlanSelected callback to navigate to WiFi setup');
      console.log('🚀 onPlanSelected callback exists:', !!onPlanSelected);
      
      if (onPlanSelected) {
        console.log('🚀 About to call onPlanSelected with:', selectedPlan);
        onPlanSelected(selectedPlan);
        console.log('🚀 onPlanSelected callback completed');
      } else {
        console.error('❌ onPlanSelected callback is missing!');
        // Fallback: try to update state directly
        updateState({ 
          step: 'wifi-setup',
          planSelected: selectedPlan 
        });
      }
      
    } catch (error) {
      console.error('❌ Error saving plan selection:', error);
      alert('Error saving plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if showing special pricing plans
  const isSpecialPricing = selectedPlan === 'home-10' || selectedPlan === 'premium-10';
  const essentialPlanId = isSpecialPricing ? 'home-10' : 'spryfi-home';
  const premiumPlanId = isSpecialPricing ? 'premium-10' : 'spryfi-home-premium';

  const plans = [
    {
      id: essentialPlanId,
      name: "SpryFi Essential",
      price: isSpecialPricing ? "$89.95/mo" : "$99.95/mo",
      originalPrice: isSpecialPricing ? "$99.95/mo" : null,
      speed: "100+ Mbps",
      description: "Perfect for streaming, video calls, and everyday work-from-home",
      specialPricing: isSpecialPricing,
      lockedNote: isSpecialPricing ? "LOCKED FOR LIFE" : null
    },
    {
      id: premiumPlanId,
      name: "SpryFi Premium", 
      price: isSpecialPricing ? "$129.95/mo" : "$139.95/mo",
      originalPrice: isSpecialPricing ? "$139.95/mo" : null,
      speed: "200+ Mbps",
      description: "Priority routing, white-glove support, and blazing performance",
      specialPricing: isSpecialPricing,
      lockedNote: isSpecialPricing ? "LOCKED FOR LIFE" : null
    }
  ];

  return (
    <div className="p-8" data-testid="plan-selection">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSpecialPricing ? "Confirm Your Special Pricing Plan" : "Pick Your Plan — No Contracts, No Surprises"}
        </h2>
        <p className="text-gray-600">
          {isSpecialPricing ? "Your forever locked-in pricing is ready to activate" : "Choose the speed that works for your home"}
        </p>
        {isSpecialPricing && (
          <div className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold text-sm inline-block">
            🔥 FLASH SALE PRICING - $10 OFF FOREVER 🔥
          </div>
        )}
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card-wrapper group relative inline-block overflow-visible">
            <div className="absolute top-1 left-1 w-full h-full rounded-2xl bg-gray-50 shadow-md transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-lg"></div>
            <div
              className={`relative cursor-pointer rounded-2xl p-6 transition-transform duration-200 ease-out bg-gradient-to-br from-blue-700 to-blue-600 text-white shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-white'
                  : 'ring-2 ring-transparent'
              }`}
              onClick={() => !loading && handlePlanSelect(plan.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {plan.specialPricing && (
                    <div className="text-xs text-yellow-200 font-semibold mt-1">
                      {plan.lockedNote}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {plan.specialPricing && plan.originalPrice && (
                    <div className="text-sm text-white/50 line-through">
                      {plan.originalPrice}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-white">
                    {plan.price}
                  </div>
                  <div className="text-sm text-white/75">
                    $0 today
                  </div>
                </div>
              </div>
              <p className="text-white/90 mb-4">
                Up to {plan.speed} • {plan.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/75">
                  Billed monthly starting at activation
                </div>
                {selectedPlan === plan.id && loading && (
                  <div className="text-white">Selecting...</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <div className="flex justify-center space-x-6">
          <span>✓ Unlimited Internet</span>
          <span>✓ No Contracts</span>
          <span>✓ 14-Day Money-Back Guarantee</span>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleContinue}
          variant="default"
          size="lg"
          disabled={!selectedPlan || loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving Plan...
            </div>
          ) : (
            'Continue to Router Setup'
          )}
        </Button>
      </div>
    </div>
  );
};
