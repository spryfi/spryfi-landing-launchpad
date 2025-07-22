import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckoutState } from '../CheckoutModal';
import { Shield } from 'lucide-react';

interface SuccessStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onClose: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ state, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SpryFi Home Internet!</h1>
          <p className="text-muted-foreground">Your setup is complete and your device will ship soon</p>
        </div>
        
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-semibold">{state.planSelected || 'Premium Plan'}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Address:</span>
              <span className="font-semibold text-right">
                {state.address?.addressLine1}<br/>
                {state.address?.city}, {state.address?.state} {state.address?.zipCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contact:</span>
              <span className="font-semibold">{state.contact?.email}</span>
            </div>
            {state.paymentIntentId && (
              <div className="flex justify-between">
                <span>Payment ID:</span>
                <span className="text-sm text-muted-foreground">{state.paymentIntentId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What's Next:</strong> You'll receive a shipping confirmation email within 24 hours with tracking information.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Installation Support:</strong> Our team will contact you to schedule device setup and activation.
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full" size="lg">
          Close
        </Button>
      </div>
    </div>
  );
};