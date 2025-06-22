
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutState } from '../CheckoutModal';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onClose: () => void;
}

export const CheckoutStep: React.FC<CheckoutStepProps> = ({ state, updateState, onClose }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mark flow as completed when user reaches checkout
    const markFlowCompleted = async () => {
      if (state.leadId) {
        try {
          const { error } = await supabase
            .from('leads_fresh')
            .update({ 
              status: 'checkout_reached',
              updated_at: new Date().toISOString()
            })
            .eq('id', state.leadId);

          if (error) {
            console.error('Error updating lead status:', error);
          } else {
            console.log('✅ Lead marked as reached checkout');
          }
        } catch (error) {
          console.error('Error marking flow as completed:', error);
        }
      }
    };

    markFlowCompleted();
  }, [state.leadId]);

  const handleCompleteOrder = async () => {
    setLoading(true);
    
    // Simulate order completion
    setTimeout(() => {
      alert('Order completed successfully!');
      onClose();
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💳</div>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Complete Your Order
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          Review your details and complete your SpryFi internet setup
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span>{state.planSelected || 'Selected Plan'}</span>
            </div>
            <div className="flex justify-between">
              <span>Router:</span>
              <span>{state.routerAdded ? 'Included' : 'Not selected'}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${state.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Contact & Address Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Service Details</h3>
          <div className="space-y-1 text-sm">
            <div>
              <strong>Name:</strong> {state.contact?.firstName} {state.contact?.lastName}
            </div>
            <div>
              <strong>Email:</strong> {state.contact?.email}
            </div>
            <div>
              <strong>Address:</strong> {state.address?.formattedAddress || 
                `${state.address?.addressLine1}, ${state.address?.city}, ${state.address?.state} ${state.address?.zipCode}`}
            </div>
          </div>
        </div>

        <Button
          onClick={handleCompleteOrder}
          disabled={loading}
          className="w-full bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold py-3 px-6 rounded-full transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Complete Order'}
        </Button>
      </div>
    </div>
  );
};
