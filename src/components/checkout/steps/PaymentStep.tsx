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
// Initialize Stripe (keeping live key as user requested)
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
    console.log('🚨🚨🚨 PAYMENT HANDLER STARTING - FULL DEBUG MODE 🚨🚨🚨');
    console.log('💳 STEP 1: Payment handler initiated');
    console.log('💳 leadId at payment start:', leadId);
    console.log('💳 leadId type:', typeof leadId);
    console.log('💳 leadId truthy?:', !!leadId);
    console.log('💳 customerData:', JSON.stringify(customerData, null, 2));
    console.log('💳 shippingCost:', shippingCost);

    if (!stripe || !elements) {
      console.error('❌ CRITICAL: Stripe or elements not available');
      toast({
        title: "Error",
        description: "Stripe is not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    console.log('✅ STEP 2: Stripe and elements verified');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('❌ CRITICAL: Card element not found');
      toast({
        title: "Error", 
        description: "Card information is required.",
        variant: "destructive",
      });
      return;
    }
    console.log('✅ STEP 3: Card element verified');

    setIsProcessing(true);
    console.log('💳 STEP 4: Processing state set to true');

    try {
      console.log('💳 STEP 5: About to create payment intent');
      console.log('💳 Payment intent payload:', {
        amount: Math.round(shippingCost * 100),
        customerEmail: customerData.email,
        customerName: `${customerData.firstName} ${customerData.lastName}`,
        leadId: leadId,
        shippingAddress: {
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode
        }
      });

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

      console.log('💳 STEP 6: Payment intent creation response');
      console.log('💳 Payment intent data:', data);
      console.log('💳 Payment intent error:', error);

      if (error) {
        console.error('❌ CRITICAL: Payment intent creation failed:', error);
        throw new Error(error.message);
      }

      console.log('✅ STEP 7: Payment intent created successfully');
      console.log('💳 Client secret received:', data.clientSecret);

      // Confirm payment with Stripe
      console.log('💳 STEP 8: About to confirm payment with Stripe');
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

      console.log('💳 STEP 9: Payment confirmation response');
      console.log('💳 Confirm error:', confirmError);
      console.log('💳 Payment intent:', paymentIntent);

      if (confirmError) {
        console.error('❌ CRITICAL: Payment confirmation failed:', confirmError);
        onPaymentError(confirmError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('🎉 STEP 10: Payment succeeded! Starting customer conversion process...');
        console.log('💳 Payment Intent ID:', paymentIntent.id);
        console.log('💳 Lead ID for conversion:', leadId);
        console.log('💳 Customer data for conversion:', JSON.stringify(customerData, null, 2));
        
        // Convert lead to customer after successful payment
        if (leadId) {
          console.log('💳 STEP 11: About to invoke convert-lead-to-customer function...');
          console.log('💳 Function payload:', {
            leadId: leadId,
            paymentIntentId: paymentIntent.id,
            customerData: customerData,
            shippingCost: shippingCost,
            activationFee: 9.90
          });
          
          try {
            console.log('💳 STEP 12: Invoking convert-lead-to-customer function...');
            const startTime = Date.now();
            
            const { data: conversionData, error: conversionError } = await supabase.functions.invoke('convert-lead-to-customer', {
              body: {
                leadId: leadId,
                paymentIntentId: paymentIntent.id,
                customerData: customerData,
                shippingCost: shippingCost,
                activationFee: 9.90
              }
            });
            
            const endTime = Date.now();
            console.log(`💳 STEP 13: Function invocation completed in ${endTime - startTime}ms`);
            console.log('💳 Conversion data:', JSON.stringify(conversionData, null, 2));
            console.log('💳 Conversion error:', JSON.stringify(conversionError, null, 2));
            
            if (conversionError) {
              console.error('❌ CRITICAL: Lead conversion error:', conversionError);
              console.error('❌ Full error object:', JSON.stringify(conversionError, null, 2));
              onPaymentError('Payment succeeded but customer setup failed. Please contact support.');
              return;
            }
            
            console.log('🎉 STEP 14: Lead converted to customer successfully!');
            console.log('✅ Conversion result:', conversionData);
          } catch (functionError) {
            console.error('❌ CRITICAL: Function invocation failed:', functionError);
            console.error('❌ Function error details:', JSON.stringify(functionError, null, 2));
            console.error('❌ Function error stack:', functionError.stack);
            onPaymentError('Payment succeeded but customer setup failed due to system error. Please contact support.');
            return;
          }
        } else {
          console.error('❌ CRITICAL: Payment succeeded but no leadId found! Cannot create customer.');
          console.error('❌ leadId value:', leadId);
          console.error('❌ leadId type:', typeof leadId);
          onPaymentError('Payment succeeded but customer setup failed due to missing lead information. Please contact support.');
          return;
        }
        
        console.log('🎉 STEP 15: All steps completed successfully! Calling onPaymentSuccess');
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error: any) {
      console.error('❌ CRITICAL: Payment processing failed:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      console.log('💳 STEP FINAL: Setting processing to false');
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

  // CRITICAL: Debug leadId presence
  console.log('🚨 PAYMENT STEP - CRITICAL LEAD DEBUG:');
  console.log('- state.leadId:', state.leadId);
  console.log('- state.leadId type:', typeof state.leadId);
  console.log('- state.leadId truthy?:', !!state.leadId);
  console.log('- Full state:', state);

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