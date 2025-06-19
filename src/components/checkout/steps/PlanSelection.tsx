
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface Plan {
  id: string;
  name: string;
  retail_price: number;
  description: string;
}

interface PlanSelectionProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ state, updateState }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('retail_price');

      if (error) throw error;
      
      // Filter or set default plans if none exist
      const defaultPlans = data && data.length > 0 ? data : [
        {
          id: 'spryfi-home',
          name: 'SpryFi Home',
          retail_price: 99.95,
          description: 'Up to 100 Mbps • Perfect for streaming, video calls, and everyday work-from-home.'
        },
        {
          id: 'spryfi-home-premium',
          name: 'SpryFi Home Premium',
          retail_price: 139.95,
          description: 'Up to 200 Mbps • Priority routing, white-glove support, and blazing performance.'
        }
      ];
      
      setPlans(defaultPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Set default plans on error
      setPlans([
        {
          id: 'spryfi-home',
          name: 'SpryFi Home',
          retail_price: 99.95,
          description: 'Up to 100 Mbps • Perfect for streaming, video calls, and everyday work-from-home.'
        },
        {
          id: 'spryfi-home-premium',
          name: 'SpryFi Home Premium',
          retail_price: 139.95,
          description: 'Up to 200 Mbps • Priority routing, white-glove support, and blazing performance.'
        }
      ]);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);

    try {
      // Update leads_fresh with selected plan (using existing columns)
      await supabase
        .from('leads_fresh')
        .update({
          usage_type: planId, // Using existing usage_type field to store plan selection
          status: 'plan_selected'
        })
        .eq('id', state.leadId);

      updateState({
        step: 'router-offer',
        planSelected: planId,
        totalAmount: 0
      });
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Error selecting plan. Please try again.');
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
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => !loading && handlePlanSelect(plan.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${plan.retail_price}/mo
                </div>
                <div className="text-sm text-gray-500">
                  $0 today
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Billed monthly starting at activation
              </div>
              {selectedPlan === plan.id && loading && (
                <div className="text-blue-600">Selecting...</div>
              )}
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
    </div>
  );
};
