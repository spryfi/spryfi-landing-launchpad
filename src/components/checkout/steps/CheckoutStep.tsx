
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface CheckoutStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onClose: () => void;
}

export const CheckoutStep: React.FC<CheckoutStepProps> = ({ state, updateState, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: state.contact?.email || '',
    fullName: '',
    shippingAddress: state.address?.formattedAddress || '',
    phone: state.contact?.phone || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    agreed: false
  });

  // Mark flow as completed when user reaches checkout
  useEffect(() => {
    const markFlowCompleted = async () => {
      if (state.leadId) {
        try {
          await supabase
            .from('leads_fresh')
            .update({ flow_completed: true })
            .eq('id', state.leadId);
          
          console.log('✅ Flow marked as completed for lead:', state.leadId);
        } catch (error) {
          console.error('Error marking flow as completed:', error);
        }
      }
    };

    markFlowCompleted();
  }, [state.leadId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.agreed) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      alert('Please fill in all payment details');
      return;
    }

    setLoading(true);

    try {
      // Update leads_fresh to mark as converted
      await supabase
        .from('leads_fresh')
        .update({
          status: 'converted'
        })
        .eq('id', state.leadId);

      // Create customer subscription using existing table structure
      await supabase
        .from('customer_subscriptions')
        .insert({
          customer_id: state.leadId, // Using lead ID as customer reference
          plan_name: state.planSelected || 'SpryFi Home',
          monthly_price: state.planSelected === 'spryfi-home-premium' ? 139.95 : 99.95,
          status: 'pending_activation'
        });

      // Show success and close modal
      alert('Order complete! You\'ll receive setup instructions via email within 24 hours.');
      onClose();
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanName = state.planSelected === 'spryfi-home-premium' ? 'SpryFi Home Premium' : 'SpryFi Home';
  const planPrice = state.planSelected === 'spryfi-home-premium' ? 139.95 : 99.95;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Complete Your Order
      </h2>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left side - Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
            <Input
              type="text"
              value={formData.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreed}
              onChange={(e) => handleInputChange('agreed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to receive updates from SpryFi and accept the Terms of Service
            </label>
          </div>
        </div>

        {/* Right side - Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{selectedPlanName}</div>
                <div className="text-sm text-gray-500">Monthly service</div>
              </div>
              <div className="text-right">
                <div className="font-medium">$0.00</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              Service will be ${planPrice}/month starting at activation
            </div>

            {state.routerAdded && (
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">WiFi 6E Router</div>
                  <div className="text-sm text-gray-500">One-time fee</div>
                </div>
                <div className="font-medium">$25.00</div>
              </div>
            )}

            <hr />

            <div className="flex justify-between text-lg font-bold">
              <span>Total Due Today</span>
              <span>${state.totalAmount.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited Internet
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                No Contracts
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                14-Day Money-Back Guarantee
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.agreed}
            className="w-full mt-6 py-4 text-lg font-semibold rounded-lg"
            style={{
              background: formData.agreed ? 'linear-gradient(90deg, #D72638 0%, #8B0000 100%)' : '#ccc',
              color: 'white',
              border: 'none'
            }}
          >
            {loading ? 'Processing...' : `Complete Order - $${state.totalAmount.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
