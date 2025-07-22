import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckoutState } from '../CheckoutModal';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onClose: () => void;
}

// Initialize Stripe
const stripePromise = loadStripe('pk_live_YrdEVqxsPoHuhkpq74UbqqjM');

function PaymentForm({ 
  shippingCost, 
  customerData, 
  onPaymentSuccess, 
  onPaymentError,
  isProcessing,
  setIsProcessing,
  leadId
}: {
  shippingCost: number;
  customerData: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  leadId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe is not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Error", 
        description: "Card information is required.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on server
      const { data, error } = await supabase.functions.invoke('create-shipping-payment', {
        body: {
          amount: Math.round(shippingCost * 100), // Convert to cents
          customerEmail: customerData.email,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          leadId: leadId,
          shippingAddress: {
            city: customerData.city,
            state: customerData.state,
            zipCode: customerData.zipCode
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${customerData.firstName} ${customerData.lastName}`,
              email: customerData.email,
            },
          },
        }
      );

      if (confirmError) {
        onPaymentError(confirmError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // Convert lead to customer after successful payment
        if (leadId) {
          const { data: conversionData, error: conversionError } = await supabase.functions.invoke('convert-lead-to-customer', {
            body: {
              leadId: leadId,
              paymentIntentId: paymentIntent.id,
              customerData: customerData,
              shippingCost: shippingCost,
              activationFee: 9.90
            }
          });
          
          if (conversionError) {
            console.error('Lead conversion error:', conversionError);
            onPaymentError('Payment succeeded but customer setup failed. Please contact support.');
            return;
          }
          
          console.log('Lead converted to customer:', conversionData);
        }
        
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error: any) {
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate totals
  const activationFee = 99.00;
  const discountPercent = 90;
  const discountedActivationFee = activationFee * ((100 - discountPercent) / 100); // $9.90
  const totalAmount = shippingCost + discountedActivationFee;

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Shipping & Handling</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Activation Fee</span>
            <span className="line-through">${activationFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Activation Fee Discount ({discountPercent}% off)</span>
            <span>-${(activationFee - discountedActivationFee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discounted Activation Fee</span>
            <span>${discountedActivationFee.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total Due Today</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-semibold mb-3">Payment Information</h3>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      {/* Important Notices */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Your card will be charged <strong>${totalAmount.toFixed(2)}</strong> today and saved for recurring billing.
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Welcome to SpryFi Home Internet!</p>
              <p>No equipment or service charges until activation. Monthly billing begins after device setup.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handlePayment} 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Complete Setup - Pay $${totalAmount.toFixed(2)}`}
      </Button>
    </div>
  );
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ state, updateState, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(16.95); // Default shipping cost
  const { toast } = useToast();

  const customerData = {
    email: state.contact?.email || '',
    firstName: state.contact?.firstName || '',
    lastName: state.contact?.lastName || '',
    phone: state.contact?.phone || '',
    address: state.address?.addressLine1 || '',
    apartment: state.address?.addressLine2 || '',
    city: state.address?.city || '',
    state: state.address?.state || '',
    zipCode: state.address?.zipCode || '',
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast({
      title: "Payment Successful!",
      description: "Your order has been confirmed. You'll receive tracking information via email.",
    });
    
    // Update state to show success
    updateState({ 
      step: 'success',
      paymentIntentId: paymentIntentId
    });
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-[#0047AB] text-3xl font-bold mb-2">SpryFi</div>
        <div className="text-gray-600 text-sm font-medium">Internet that just works</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Your Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <PaymentForm
              shippingCost={shippingCost}
              customerData={customerData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              leadId={state.leadId}
            />
          </Elements>
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          onClick={() => updateState({ step: 'checkout' })}
          disabled={isProcessing}
        >
          ← Back to Order Details
        </Button>
      </div>
    </div>
  );
};