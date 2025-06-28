import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface PlanSelectionProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ state, updateState }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = (planType: string) => {
    setSelectedPlan(planType);
    console.log('Selected plan:', planType);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Update leads_fresh with selected plan
      await supabase
        .from('leads_fresh')
        .update({
          status: 'plan_selected',
          // Add any plan-specific fields here if needed
        })
        .eq('id', state.leadId);

      updateState({
        step: 'wifi-setup',
        planSelected: selectedPlan
      });
    } catch (error) {
      console.error('Error saving plan selection:', error);
      alert('Error saving plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
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
          variant="primary"
          size="lg"
          disabled={!selectedPlan}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
