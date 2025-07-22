
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckoutState } from '../CheckoutModal';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, CreditCard, Truck, Clock } from 'lucide-react';
import { getShippingRate, getShippingOrigin } from '@/utils/shipping';

interface CheckoutStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
  onClose: () => void;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

export const CheckoutStep: React.FC<CheckoutStepProps> = ({ state, updateState, onClose }) => {
  const [formData, setFormData] = useState({
    email: state.contact?.email || '',
    firstName: state.contact?.firstName || '',
    lastName: state.contact?.lastName || '',
    phone: state.contact?.phone || '',
    address: state.address?.addressLine1 || '',
    apartment: state.address?.addressLine2 || '',
    city: state.address?.city || '',
    state: state.address?.state || '',
    zipCode: state.address?.zipCode || '',
    dateOfBirth: { month: '', day: '', year: '' },
    emailOptIn: true,
    smsOptIn: false,
    sameAsBilling: true
  });

  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
    estimatedDays: '5'
  });

  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingOrigin, setShippingOrigin] = useState<{city: string; state: string} | null>(null);
  const [shippingInfo, setShippingInfo] = useState<{cost: number; estimatedDays: string; zoneName: string} | null>(null);

  // Fetch shipping origin on mount
  useEffect(() => {
    const fetchOrigin = async () => {
      const origin = await getShippingOrigin();
      setShippingOrigin({ city: origin.city, state: origin.state });
    };
    fetchOrigin();
  }, []);

  // Calculate shipping based on state using database
  const calculateShipping = async (stateCode: string) => {
    if (!stateCode) return;

    try {
      setCalculatingShipping(true);
      
      // Fetch rate from database
      const shippingData = await getShippingRate(stateCode);
      
      setShippingInfo(shippingData);
      setOrderSummary(prev => ({
        ...prev,
        shipping: shippingData.cost,
        total: prev.subtotal + shippingData.cost,
        estimatedDays: shippingData.estimatedDays
      }));
    } catch (error) {
      console.error('Error calculating shipping:', error);
      // Fallback to default shipping
      setOrderSummary(prev => ({
        ...prev,
        shipping: 16.95,
        total: prev.subtotal + 16.95,
        estimatedDays: '5'
      }));
    } finally {
      setCalculatingShipping(false);
    }
  };

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

  // Auto-calculate shipping when state changes
  useEffect(() => {
    if (formData.state) {
      calculateShipping(formData.state);
    }
  }, [formData.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("🧾 Checkout form submission started");
    console.log("🧾 CRITICAL: leadId at checkout transition:", state.leadId);
    console.log("🧾 CRITICAL: Full state at checkout transition:", state);
    
    if (!isFormValid) {
      alert('Please fill in all required fields.');
      return;
    }

    // Navigate to payment step instead of submitting directly
    console.log("🧾 Transitioning to payment step with leadId:", state.leadId);
    updateState({ step: 'payment' });
  };

  const isFormValid = formData.email && formData.firstName && formData.lastName && 
                     formData.address && formData.city && formData.state && formData.zipCode;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-[#0047AB] text-3xl font-bold mb-2">SpryFi</div>
        <div className="text-gray-600 text-sm font-medium">Internet that just works</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Checkout Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Complete Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center justify-between">
                  Contact Information
                  <span className="text-sm font-normal text-gray-500">Already have an account? Log in</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <Label>Date of Birth</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formData.dateOfBirth.month}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dateOfBirth: { ...prev.dateOfBirth, month: e.target.value }
                      }))}
                    >
                      <option value="">Month</option>
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i} value={i + 1}>
                          {new Date(0, i).toLocaleString('en', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formData.dateOfBirth.day}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dateOfBirth: { ...prev.dateOfBirth, day: e.target.value }
                      }))}
                    >
                      <option value="">Day</option>
                      {Array.from({length: 31}, (_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formData.dateOfBirth.year}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dateOfBirth: { ...prev.dateOfBirth, year: e.target.value }
                      }))}
                    >
                      <option value="">Year</option>
                      {Array.from({length: 80}, (_, i) => {
                        const year = new Date().getFullYear() - 18 - i;
                        return <option key={i} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h3>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="apartment">Apartment, Suite, etc. (Optional)</Label>
                  <Input
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Communication Preferences</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailOptIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailOptIn: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Email me with news and offers</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smsOptIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, smsOptIn: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Text me with updates and offers</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Item */}
              <div className="flex justify-between items-start p-4 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{state.planSelected || 'SpryFi Premium'} Plan</h4>
                  <p className="text-sm text-gray-600 mb-2">Unlimited 5G Home Internet</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Charged after activation
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">From $79/mo</span>
                </div>
              </div>

              {/* Router Item */}
              <div className="flex justify-between items-start p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">SpryFi WiFi 7 AI Router</h4>
                  <p className="text-sm text-gray-600 mb-2">High-performance commercial-grade router with AI optimization</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• WiFi 7 with 6GHz band</li>
                    <li>• AI-powered optimization</li>
                    <li>• Easy plug-and-play setup</li>
                    <li>• Covers up to 3,000 sq ft</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-red-500 line-through">$599.00</div>
                  <div className="text-sm font-medium text-green-600">100% Off</div>
                  <div className="text-lg font-bold">$0.00</div>
                </div>
              </div>

              {/* SIM Card */}
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">SIM Card & Activation Kit</h4>
                  <p className="text-sm text-gray-600">SpryFi 5G Data SIM</p>
                </div>
                <div className="text-lg font-bold text-green-600">FREE</div>
              </div>

              <Separator />

               {/* Shipping */}
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <span>Subtotal</span>
                   <span>$0.00</span>
                 </div>
                 
                 {calculatingShipping ? (
                   <div className="flex justify-between items-center">
                     <span className="flex items-center gap-2">
                       <Truck className="w-4 h-4" />
                       Calculating shipping...
                     </span>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                   </div>
                 ) : (
                   <div className="flex justify-between">
                     <span className="flex items-center gap-2">
                       <Truck className="w-4 h-4" />
                       Shipping from {shippingOrigin?.city || 'Austin'}, {shippingOrigin?.state || 'TX'}
                       {shippingInfo && (
                         <span className="text-xs text-gray-500">({shippingInfo.zoneName})</span>
                       )}
                     </span>
                     <span>${orderSummary.shipping.toFixed(2)}</span>
                   </div>
                 )}
                 
                 {formData.state && !calculatingShipping && (
                   <div className="flex justify-between text-sm text-gray-600">
                     <span className="flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       Estimated delivery
                     </span>
                     <span>{orderSummary.estimatedDays} business days</span>
                   </div>
                 )}
               </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${orderSummary.total.toFixed(2)}</span>
              </div>

              {/* Payment Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">No monthly charges until activation</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your service plan will only be charged after you plug in and activate your device. 
                      Cancel anytime before activation with no fees.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Processing Order...' : 'Complete Order'}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By placing this order, you agree to our Terms of Service and Privacy Policy.
                  You will receive a confirmation email with tracking information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
