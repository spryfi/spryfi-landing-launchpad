
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
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [discountedPrices, setDiscountedPrices] = useState<Record<string, number>>({});

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

  const validateAndApplyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    setPromoError('');

    if (!code) {
      setPromoApplied(false);
      setDiscountedPrices({});
      return;
    }

    if (!/^[A-Z0-9]{5}$/.test(code)) {
      setPromoError('Invalid code format. Use 5 characters (A-Z, 0-9).');
      return;
    }

    try {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        setPromoError('This code is invalid or has already been used.');
        return;
      }

      // Check if code is expired
      if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
        setPromoError('This code has expired.');
        return;
      }

      // Check usage limit
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        setPromoError('This code has reached its usage limit.');
        return;
      }

      // Apply discount to all plans
      const newDiscountedPrices: Record<string, number> = {};
      plans.forEach(plan => {
        if (promo.plan_override && promo.plan_override !== plan.id) {
          // If there's a plan override and this isn't the target plan, no discount
          newDiscountedPrices[plan.id] = plan.retail_price;
        } else {
          // Apply discount
          const discountPercent = promo.discount_percent || 0;
          newDiscountedPrices[plan.id] = plan.retail_price * (1 - discountPercent / 100);
        }
      });

      setDiscountedPrices(newDiscountedPrices);
      setPromoApplied(true);
      setPromoError('');

      console.log('✅ Promo code applied:', { code, discount: promo.discount_percent, override: promo.plan_override });
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoError('Error validating code. Please try again.');
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);

    try {
      const selectedPlanData = plans.find(p => p.id === planId);
      if (!selectedPlanData) throw new Error('Plan not found');

      const finalPrice = discountedPrices[planId] || selectedPlanData.retail_price;
      
      // Update leads_fresh with selected plan and promo code info
      const updateData: any = {
        usage_type: planId,
        status: 'plan_selected'
      };

      // If promo code is applied, save promo code details
      if (promoApplied && promoCode) {
        const code = promoCode.trim().toUpperCase();
        
        // Get promo details for saving
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', code)
          .single();

        if (promo) {
          updateData.promo_code = code;
          updateData.promo_code_discount_percent = promo.discount_percent;
          updateData.promo_code_plan_override = promo.plan_override;
          updateData.discounted_price = finalPrice;

          // Update promo code usage
          await supabase
            .from('promo_codes')
            .update({
              usage_count: promo.usage_count + 1,
              is_active: (promo.usage_count + 1) < (promo.usage_limit || 1)
            })
            .eq('code', code);

          console.log('✅ Promo code redeemed and marked as used');
        }
      }

      await supabase
        .from('leads_fresh')
        .update(updateData)
        .eq('id', state.leadId);

      updateState({
        step: 'router-offer',
        planSelected: planId,
        totalAmount: finalPrice
      });
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Error selecting plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (plan: Plan) => {
    return discountedPrices[plan.id] || plan.retail_price;
  };

  const getOriginalPrice = (plan: Plan) => {
    return plan.retail_price;
  };

  const hasDiscount = (plan: Plan) => {
    return promoApplied && discountedPrices[plan.id] < plan.retail_price;
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

      {/* Promo Code Section */}
      <div className="max-w-md mx-auto mb-8 p-4 bg-gray-50 rounded-lg">
        <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
          Have a promo code?
        </label>
        <div className="flex gap-2">
          <input
            id="promo-code"
            type="text"
            maxLength={5}
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              if (e.target.value.length === 0) {
                setPromoApplied(false);
                setDiscountedPrices({});
                setPromoError('');
              }
            }}
            onBlur={validateAndApplyPromoCode}
            placeholder="e.g. F4D5C"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm uppercase tracking-widest"
          />
          <Button
            onClick={validateAndApplyPromoCode}
            variant="outline"
            size="sm"
            disabled={!promoCode.trim()}
          >
            Apply
          </Button>
        </div>
        
        {promoError && (
          <p className="mt-2 text-sm text-red-600">{promoError}</p>
        )}
        
        {promoApplied && !promoError && (
          <p className="mt-2 text-sm text-green-600">✅ Promo code applied!</p>
        )}
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
                  ${getPlanPrice(plan).toFixed(2)}/mo
                  {hasDiscount(plan) && (
                    <span className="ml-2 text-lg line-through text-gray-500">
                      ${getOriginalPrice(plan).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  $0 today
                </div>
                {hasDiscount(plan) && (
                  <div className="text-sm text-green-600 font-medium">
                    Promo applied!
                  </div>
                )}
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
