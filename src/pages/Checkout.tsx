import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Truck, CreditCard, Lock } from 'lucide-react';
import { getShippingRate } from '@/utils/shipping';
import { states } from '@/constants/states';
import { useToast } from '@/hooks/use-toast';
import { loadUserData, hasUserData } from '@/utils/userDataUtils';
import { Info } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const checkoutSchema = z.object({
  // Contact
  email: z.string().email('Please enter a valid email address'),
  emailOffers: z.boolean().default(true),
  birthMonth: z.string().min(1, 'Month is required'),
  birthDay: z.string().min(1, 'Day is required'),
  birthYear: z.string().min(1, 'Year is required'),
  
  // Delivery
  country: z.string().default('US'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  phone: z.string().min(10, 'Phone number is required'),
  saveInfo: z.boolean().default(false),
  textOffers: z.boolean().default(false),
  
  // Billing
  billingAddressType: z.enum(['same', 'different']).default('same'),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingCompany: z.string().optional(),
  billingAddress: z.string().optional(),
  billingApartment: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

// Initialize Stripe
const stripePromise = loadStripe('pk_live_YrdEVqxsPoHuhkpq74UbqqjM');

// Payment form component
function PaymentForm({ 
  shippingCost, 
  customerData, 
  onPaymentSuccess, 
  onPaymentError,
  isProcessing,
  setIsProcessing 
}: {
  shippingCost: number;
  customerData: any;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
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
      // Get lead ID from session storage
      const leadId = sessionStorage.getItem('leadId');
      
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
        const leadId = sessionStorage.getItem('leadId');
        if (leadId) {
          const { data: conversionData, error: conversionError } = await supabase.functions.invoke('convert-lead-to-customer', {
            body: {
              leadId: leadId,
              paymentIntentId: paymentIntent.id,
              customerData: customerData,
              shippingCost: shippingCost,
              activationFee: 9.90 // $99 with 90% discount
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

export default function Checkout() {
  const { toast } = useToast();
  const [shipping, setShipping] = useState<{cost: number; estimatedDays: string; zoneName: string} | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [showAutoFillMessage, setShowAutoFillMessage] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'US',
      emailOffers: true,
      saveInfo: false,
      textOffers: false,
      billingAddressType: 'same',
    },
  });

  const watchedState = form.watch('state');
  const watchedBillingType = form.watch('billingAddressType');
  const formValues = form.watch();

  // Auto-populate fields on component mount
  useEffect(() => {
    const userData = loadUserData();
    if (hasUserData()) {
      // Auto-populate available fields
      if (userData.email) form.setValue('email', userData.email);
      if (userData.firstName) form.setValue('firstName', userData.firstName);
      if (userData.lastName) form.setValue('lastName', userData.lastName);
      
      // Auto-populate address fields if available
      if (userData.address?.addressLine1) form.setValue('address', userData.address.addressLine1);
      if (userData.address?.addressLine2) form.setValue('apartment', userData.address.addressLine2);
      if (userData.address?.city) form.setValue('city', userData.address.city);
      if (userData.address?.state) form.setValue('state', userData.address.state);
      if (userData.address?.zipCode) form.setValue('zipCode', userData.address.zipCode);
      if (userData.address?.phone) form.setValue('phone', userData.address.phone);
      
      setShowAutoFillMessage(true);
      console.log('✅ Auto-populated checkout form with user data:', userData);
    }
  }, [form]);

  // Calculate shipping when state changes
  useEffect(() => {
    if (watchedState) {
      setIsLoadingShipping(true);
      getShippingRate(watchedState)
        .then(setShipping)
        .catch(console.error)
        .finally(() => setIsLoadingShipping(false));
    }
  }, [watchedState]);

  const useMySignupInformation = () => {
    const userData = loadUserData();
    
    // Populate all available fields, overwriting current values
    if (userData.email) form.setValue('email', userData.email);
    if (userData.firstName) form.setValue('firstName', userData.firstName);
    if (userData.lastName) form.setValue('lastName', userData.lastName);
    
    // Populate address fields
    if (userData.address?.addressLine1) form.setValue('address', userData.address.addressLine1);
    if (userData.address?.addressLine2) form.setValue('apartment', userData.address.addressLine2);
    if (userData.address?.city) form.setValue('city', userData.address.city);
    if (userData.address?.state) form.setValue('state', userData.address.state);
    if (userData.address?.zipCode) form.setValue('zipCode', userData.address.zipCode);
    if (userData.address?.phone) form.setValue('phone', userData.address.phone);
    
    setShowAutoFillMessage(true);
    
    toast({
      title: "Information filled",
      description: "We've populated your details from your signup information.",
    });
  };

  const isFormValid = () => {
    const requiredFields = [
      'email', 'birthMonth', 'birthDay', 'birthYear',
      'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'
    ];
    
    const missingFields = [];
    for (const field of requiredFields) {
      if (!formValues[field as keyof CheckoutForm]) {
        missingFields.push(field);
      }
    }

    if (watchedBillingType === 'different') {
      const billingFields = ['billingFirstName', 'billingLastName', 'billingAddress', 'billingCity', 'billingState', 'billingZipCode'];
      for (const field of billingFields) {
        if (!formValues[field as keyof CheckoutForm]) {
          missingFields.push(field);
        }
      }
    }

    // Debug: log missing fields with details
    if (missingFields.length > 0) {
      console.log('🔍 Missing required fields:', missingFields);
      console.log('📝 Current form values:', formValues);
      console.log('📋 Specific missing fields:');
      missingFields.forEach(field => {
        console.log(`  - ${field}: "${formValues[field as keyof CheckoutForm] || 'EMPTY'}"`);
      });
    }

    return missingFields.length === 0;
  };

  const handleCompleteOrder = async (data: CheckoutForm) => {
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before proceeding to payment.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setPaymentIntentId(paymentId);
    
    try {
      // Save order with payment information
      const orderData = {
        ...form.getValues(),
        shipping,
        paymentIntentId: paymentId,
        paymentStatus: 'paid',
        totalAmount: shipping?.cost || 0,
        orderDate: new Date().toISOString()
      };
      
      console.log('Order completed with payment:', orderData);
      
      toast({
        title: "Payment Successful!",
        description: "Your order has been confirmed. You'll receive tracking information via email.",
      });
      
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Error",
        description: "Payment succeeded but failed to save order. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Confirmation page
  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
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
                  <span>Shipping Cost:</span>
                  <span className="font-semibold">${shipping?.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activation Fee (90% discount applied):</span>
                  <span className="font-semibold">$9.90</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Paid:</span>
                  <span>${((shipping?.cost || 0) + 9.90).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="text-sm text-muted-foreground">{paymentIntentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>{shipping?.estimatedDays}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next Steps:</strong> You'll receive tracking information via email. Your card is now saved for monthly service billing, which begins after device activation and setup.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {currentStep === 'form' ? 'Complete Your Order' : 'Payment Information'}
            </h1>
            <p className="text-muted-foreground">
              {currentStep === 'form' 
                ? 'Final step before your SpryFi Home device ships'
                : 'Secure payment for shipping charges'
              }
            </p>
          </div>

          {/* Auto-fill message and button */}
          {hasUserData() && currentStep === 'form' && (
            <div className="mb-6">
              {showAutoFillMessage && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <Info className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-800 text-sm">
                    We've filled in your details from your signup/qualification. Please confirm or edit if needed.
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={useMySignupInformation}
                className="w-full max-w-md mx-auto flex"
              >
                Use my signup information
              </Button>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && shipping && (
            <div className="space-y-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('form')}
                className="mb-4"
              >
                ← Back to Order Details
              </Button>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentForm
                    shippingCost={shipping.cost}
                    customerData={form.getValues()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isProcessing={isProcessingPayment}
                    setIsProcessing={setIsProcessingPayment}
                  />
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Payments secured by Stripe. PCI DSS compliant.</span>
              </div>
            </div>
          )}

          {/* Form Step */}
          {currentStep === 'form' && (
            <form onSubmit={form.handleSubmit(handleCompleteOrder)} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailOffers"
                      checked={form.watch('emailOffers')}
                      onCheckedChange={(checked) => form.setValue('emailOffers', !!checked)}
                    />
                    <Label htmlFor="emailOffers" className="text-sm">Email me with news and offers</Label>
                  </div>

                  <div>
                    <Label>Date of Birth *</Label>
                    <div className="grid grid-cols-3 gap-3 mt-1">
                      <Select onValueChange={(value) => form.setValue('birthMonth', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select onValueChange={(value) => form.setValue('birthDay', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select onValueChange={(value) => form.setValue('birthYear', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="country">Country/Region</Label>
                    <Select defaultValue="US" onValueChange={(value) => form.setValue('country', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First name *</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        className="mt-1"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name *</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        className="mt-1"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input
                      id="company"
                      {...form.register('company')}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      {...form.register('address')}
                      className="mt-1"
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      {...form.register('apartment')}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...form.register('city')}
                        className="mt-1"
                      />
                      {form.formState.errors.city && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select onValueChange={(value) => form.setValue('state', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.state && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP code *</Label>
                      <Input
                        id="zipCode"
                        {...form.register('zipCode')}
                        className="mt-1"
                      />
                      {form.formState.errors.zipCode && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      className="mt-1"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInfo"
                        checked={form.watch('saveInfo')}
                        onCheckedChange={(checked) => form.setValue('saveInfo', !!checked)}
                      />
                      <Label htmlFor="saveInfo" className="text-sm">Save this information for next time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="textOffers"
                        checked={form.watch('textOffers')}
                        onCheckedChange={(checked) => form.setValue('textOffers', !!checked)}
                      />
                      <Label htmlFor="textOffers" className="text-sm">Text me with news and offers</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {watchedState && !isLoadingShipping && shipping ? (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{shipping.zoneName}</p>
                          <p className="text-sm text-muted-foreground">
                            Estimated delivery: {shipping.estimatedDays} business days from Buda, TX
                          </p>
                        </div>
                        <p className="font-semibold">${shipping.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-muted/10 border-dashed text-center">
                      <p className="text-muted-foreground">
                        {!watchedState 
                          ? "Enter your shipping address to view available shipping methods"
                          : isLoadingShipping 
                          ? "Calculating shipping rates..."
                          : "Unable to calculate shipping"
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={watchedBillingType}
                    onValueChange={(value: 'same' | 'different') => form.setValue('billingAddressType', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same" id="same" />
                      <Label htmlFor="same">Same as shipping address</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="different" id="different" />
                      <Label htmlFor="different">Use a different billing address</Label>
                    </div>
                  </RadioGroup>

                  {watchedBillingType === 'different' && (
                    <div className="mt-6 space-y-4 border-t pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">First name *</Label>
                          <Input
                            id="billingFirstName"
                            {...form.register('billingFirstName')}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Last name *</Label>
                          <Input
                            id="billingLastName"
                            {...form.register('billingLastName')}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingCompany">Company (optional)</Label>
                        <Input
                          id="billingCompany"
                          {...form.register('billingCompany')}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="billingAddress">Address *</Label>
                        <Input
                          id="billingAddress"
                          {...form.register('billingAddress')}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="billingApartment">Apartment, suite, etc. (optional)</Label>
                        <Input
                          id="billingApartment"
                          {...form.register('billingApartment')}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">City *</Label>
                          <Input
                            id="billingCity"
                            {...form.register('billingCity')}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingState">State *</Label>
                          <Select onValueChange={(value) => form.setValue('billingState', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="billingZipCode">ZIP code *</Label>
                          <Input
                            id="billingZipCode"
                            {...form.register('billingZipCode')}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Complete Order */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!isFormValid() || isLoadingShipping}
                >
                  {isLoadingShipping ? "Calculating shipping..." : "Proceed to Payment"}
                </Button>
              </div>
            </form>
          )}

          {/* Footer Links */}
          <footer className="mt-12 pt-8 border-t">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Refund policy</a>
              <a href="#" className="hover:text-foreground">Privacy policy</a>
              <a href="#" className="hover:text-foreground">Terms of service</a>
              <a href="#" className="hover:text-foreground">Cancellation policy</a>
            </div>
          </footer>
        </div>
      </div>
    </Elements>
  );
}