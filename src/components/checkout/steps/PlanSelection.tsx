
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface PlanSelectionProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onPlanSelected?: (planType: string) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ state, updateState, onPlanSelected }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Save plan selection to database
      const planData = {
        plan_selected: selectedPlan === 'spryfi-home' ? 'SpryFi Home' : 'SpryFi Home Premium',
        plan_price: selectedPlan === 'spryfi-home' ? 99.95 : 139.95,
        plan_speed: selectedPlan === 'spryfi-home' ? '100+ Mbps' : '200+ Mbps'
      };

      // Update leads_fresh with selected plan
      await supabase
        .from('leads_fresh')
        .update({
          status: 'plan_selected',
          // Add any plan-specific fields here if needed
        })
        .eq('id', state.leadId);

      console.log('✅ Plan saved successfully:', planData);

      // CRITICAL: Force immediate navigation to WiFi setup
      console.log('🚀 Calling onPlanSelected callback to navigate to WiFi setup');
      if (onPlanSelected) {
        onPlanSelected(selectedPlan);
      }
      
      // Also update state directly as fallback
      console.log('🚀 Updating state directly as fallback');
      updateState({
        planSelected: selectedPlan,
        step: 'wifi-setup'
      });
      
      // Extra logging to verify the update
      setTimeout(() => {
        console.log('🔍 POST-UPDATE STATE CHECK (in PlanSelection)');
      }, 500);
      
    } catch (error) {
      console.error('❌ Error saving plan selection:', error);
      alert('Error saving plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8" data-testid="plan-selection">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Pick Your Plan — No Contracts, No Surprises
        </h2>
        <p className="text-gray-600">
          Choose the speed that works for your home
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        <div
          key="spryfi-home"
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'spryfi-home'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => !loading && handlePlanSelect('spryfi-home')}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">SpryFi Home</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                $99.95/mo
              </div>
              <div className="text-sm text-gray-500">
                $0 today
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Up to 100 Mbps • Perfect for streaming, video calls, and everyday work-from-home.
          </p>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Billed monthly starting at activation
            </div>
            {selectedPlan === 'spryfi-home' && loading && (
              <div className="text-blue-600">Selecting...</div>
            )}
          </div>
        </div>

        <div
          key="spryfi-home-premium"
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'spryfi-home-premium'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => !loading && handlePlanSelect('spryfi-home-premium')}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">SpryFi Home Premium</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                $139.95/mo
              </div>
              <div className="text-sm text-gray-500">
                $0 today
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Up to 200 Mbps • Priority routing, white-glove support, and blazing performance.
          </p>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Billed monthly starting at activation
            </div>
            {selectedPlan === 'spryfi-home-premium' && loading && (
              <div className="text-blue-600">Selecting...</div>
            )}
          </div>
        </div>
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
