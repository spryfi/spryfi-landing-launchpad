import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Lock, Shield, MapPin, Calendar, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe('pk_live_YrdEVqxsPoHuhkpq74UbqqjM');

const INSTALLATION_FEE = 69_00; // $69.00 in cents

interface DirectCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

/* ─── Payment form (needs to be inside <Elements>) ─── */
function InstallPaymentForm({
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
  leadId,
  customerData,
}: {
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  leadId: string | null;
  customerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast({ title: 'Error', description: 'Stripe is not loaded. Please refresh.', variant: 'destructive' });
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({ title: 'Error', description: 'Card information is required.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      // Create payment intent via edge function
      const { data, error } = await supabase.functions.invoke('create-installation-payment', {
        body: {
          amount: INSTALLATION_FEE,
          customerEmail: customerData.email,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          leadId,
          serviceAddress: {
            addressLine1: customerData.addressLine1,
            city: customerData.city,
            state: customerData.state,
            zipCode: customerData.zipCode,
          },
        },
      });

      if (error) throw new Error(error.message);

      // Confirm with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerData.firstName} ${customerData.lastName}`,
            email: customerData.email,
          },
        },
      });

      if (confirmError) {
        onError(confirmError.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Send notification email to info@sprywireless.com
        try {
          await supabase.functions.invoke('notify-installation-lead', {
            body: {
              leadId,
              paymentIntentId: paymentIntent.id,
              firstName: customerData.firstName,
              lastName: customerData.lastName,
              email: customerData.email,
              phone: customerData.phone,
              addressLine1: customerData.addressLine1,
              city: customerData.city,
              state: customerData.state,
              zipCode: customerData.zipCode,
            },
          });
        } catch (emailErr) {
          console.error('Email notification failed (non-blocking):', emailErr);
        }

        // Update lead status
        if (leadId) {
          try {
            await supabase.from('leads_fresh').update({
              status: 'installation_paid',
              updated_at: new Date().toISOString(),
            }).eq('id', leadId);
          } catch (dbErr) {
            console.error('Lead update failed (non-blocking):', dbErr);
          }
        }

        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      onError(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Order summary */}
      <div className="p-4 border rounded-lg bg-gray-50 space-y-2 text-sm">
        <h3 className="font-semibold text-base">Order Summary</h3>
        <div className="flex justify-between">
          <span>Professional Installation</span>
          <span className="font-medium">$69.00</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-semibold text-base">
          <span>Total Due Today</span>
          <span>$69.00</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Monthly service of $89.99/mo begins after installation &amp; activation.
        </p>
      </div>

      {/* Stripe card element */}
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Payment Information
        </h3>
        <CardElement
          options={{
            style: {
              base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            },
          }}
        />
      </div>

      {/* Notices */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Lock className="w-4 h-4 flex-shrink-0 text-blue-600" />
        <span>Your card will be charged <strong>$69.00</strong> today for the installation fee.</span>
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 flex-shrink-0 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">No monthly charges until activation</p>
            <p className="text-xs mt-0.5">Your $89.99/mo plan begins only after we install and activate your service.</p>
          </div>
        </div>
      </div>

      <Button onClick={handlePayment} disabled={!stripe || isProcessing} className="w-full" size="lg">
        {isProcessing ? 'Processing…' : 'Pay $69.00 — Schedule Installation'}
      </Button>
    </div>
  );
}

/* ─── Main modal ─── */
export const DirectCheckoutModal: React.FC<DirectCheckoutProps> = ({ isOpen, onClose, address, contact }) => {
  const [step, setStep] = useState<'confirm' | 'payment' | 'success'>('confirm');
  const [leadId, setLeadId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Editable contact fields
  const [phone, setPhone] = useState(contact.phone || '');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setPaymentId(null);
      setIsProcessing(false);
      setPhone(contact.phone || '');
      // Create or update lead
      createLead();
    }
  }, [isOpen]);

  const createLead = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('save-lead', {
        body: {
          email: contact.email,
          first_name: contact.firstName,
          last_name: contact.lastName,
          started_at: new Date().toISOString(),
          status: 'installation_started',
        },
      });
      if (data?.lead_id) setLeadId(data.lead_id);
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const customerData = {
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone,
    addressLine1: address.addressLine1,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
  };

  const handleSuccess = (paymentIntentId: string) => {
    setPaymentId(paymentIntentId);
    setStep('success');
    toast({ title: 'Payment Successful!', description: "We'll reach out to schedule your installation." });
  };

  const handleError = (msg: string) => {
    toast({ title: 'Payment Failed', description: msg, variant: 'destructive' });
  };

  /* ─── Step renderers ─── */
  const renderConfirm = () => (
    <div className="p-6 bg-white rounded-2xl max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-[#0047AB] text-3xl font-bold">SpryFi</div>
        <div className="text-gray-500 text-sm mt-1">Professional Installation</div>
      </div>

      {/* Plan */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">SpryFi Home</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-extrabold text-gray-900">$89.99</span>
          <span className="text-gray-500">/mo</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Unlimited home internet · No contracts</p>
      </div>

      {/* Service address */}
      <div className="space-y-1">
        <Label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Service / Installation Address
        </Label>
        <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-800">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
          <br />
          {address.city}, {address.state} {address.zipCode}
        </div>
      </div>

      {/* Contact (read-only name/email, editable phone) */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 uppercase tracking-wider">Contact Information</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dc-first" className="text-xs">First Name</Label>
            <Input id="dc-first" value={contact.firstName} disabled className="bg-gray-50" />
          </div>
          <div>
            <Label htmlFor="dc-last" className="text-xs">Last Name</Label>
            <Input id="dc-last" value={contact.lastName} disabled className="bg-gray-50" />
          </div>
        </div>
        <div>
          <Label htmlFor="dc-email" className="text-xs">Email</Label>
          <Input id="dc-email" type="email" value={contact.email} disabled className="bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="dc-phone" className="text-xs">
            Phone Number <span className="text-gray-400">(for scheduling)</span>
          </Label>
          <Input
            id="dc-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
          />
        </div>
      </div>

      {/* What's included */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wider">What's Included</Label>
        <div className="space-y-2">
          {[
            'Professional on-site installation',
            'All equipment configured & tested',
            'Truly unlimited — no data caps, ever',
            'No contracts, cancel anytime',
            '14-day money-back guarantee',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Installation fee callout */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <Calendar className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span>One-time <strong>$69 installation fee</strong> — we'll schedule a time that works for you.</span>
      </div>

      <Button
        onClick={() => setStep('payment')}
        disabled={!phone.trim()}
        className="w-full py-4 bg-[#0047AB] hover:bg-[#0060D4] text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
        size="lg"
      >
        Continue to Payment
      </Button>
    </div>
  );

  const renderPayment = () => (
    <div className="p-6 bg-white rounded-2xl max-w-lg mx-auto space-y-4">
      <div className="text-center mb-2">
        <div className="text-[#0047AB] text-3xl font-bold">SpryFi</div>
        <div className="text-gray-500 text-sm mt-1">Complete Your Installation Payment</div>
      </div>

      <Elements stripe={stripePromise}>
        <InstallPaymentForm
          onSuccess={handleSuccess}
          onError={handleError}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          leadId={leadId}
          customerData={customerData}
        />
      </Elements>

      <div className="text-center pt-2">
        <Button variant="ghost" onClick={() => setStep('confirm')} disabled={isProcessing} className="text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-6 bg-white rounded-2xl max-w-lg mx-auto text-center space-y-6">
      {/* Green check */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Shield className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
        <p className="text-gray-600">Your installation has been scheduled and our team will be in touch shortly.</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-semibold">SpryFi Home — $89.99/mo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Installation Fee</span>
            <span className="font-semibold">$69.00 (paid)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service Address</span>
            <span className="font-semibold text-right">
              {address.addressLine1}<br />
              {address.city}, {address.state} {address.zipCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact</span>
            <span className="font-semibold">{contact.email}</span>
          </div>
          {paymentId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Payment ID</span>
              <span className="text-xs text-gray-400">{paymentId}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>What's Next:</strong> Our installation team will call you at{' '}
          <strong>{phone}</strong> within 1 business day to schedule your appointment.
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <strong>Remember:</strong> No monthly charges until your service is installed and activated.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={() => (window.location.href = '/')} className="w-full" size="lg">
          Go to SpryFi Home
        </Button>
        <Button onClick={onClose} variant="outline" className="w-full" size="lg">
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">SpryFi Installation Checkout</DialogTitle>
        <DialogDescription className="sr-only">
          Confirm your details and pay the installation fee to get SpryFi internet at your address
        </DialogDescription>
        {step === 'confirm' && renderConfirm()}
        {step === 'payment' && renderPayment()}
        {step === 'success' && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
};
