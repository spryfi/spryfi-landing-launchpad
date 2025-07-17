import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, MapPin } from 'lucide-react';
import { getShippingRate } from '@/utils/shipping';

interface ShippingRate {
  cost: number;
  estimatedDays: string;
  zoneName: string;
}

const Checkout = () => {
  // Contact information
  const [email, setEmail] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [emailOffers, setEmailOffers] = useState(false);

  // Delivery information
  const [country, setCountry] = useState('United States');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [textOffers, setTextOffers] = useState(false);

  // Shipping
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [selectedShipping, setSelectedShipping] = useState('standard');

  // Billing
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingCompany, setBillingCompany] = useState('');
  const [billingStreetAddress, setBillingStreetAddress] = useState('');
  const [billingApartment, setBillingApartment] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipCode, setBillingZipCode] = useState('');

  // Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Calculate shipping rate when state changes
  useEffect(() => {
    if (state) {
      getShippingRate(state).then(setShippingRate);
    }
  }, [state]);

  // Order summary calculations
  const simCost = 0;
  const routerCost = 0;
  const planCost = 99.95;
  const shippingCost = shippingRate?.cost || 0;
  const taxRate = 0.08;
  const subtotal = simCost + routerCost + shippingCost;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Form validation
  const isFormValid = 
    email &&
    firstName &&
    lastName &&
    streetAddress &&
    city &&
    state &&
    zipCode &&
    phone &&
    agreedToTerms;

  const handleCompleteOrder = () => {
    if (!isFormValid) return;
    
    // Handle order completion - integrate with Stripe here
    console.log('Order completed');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card shadow-lg">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

                {/* Contact Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="birthMonth">Birth Month</Label>
                        <Select value={birthMonth} onValueChange={setBirthMonth}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={month} value={(index + 1).toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="birthDay">Birth Day</Label>
                        <Select value={birthDay} onValueChange={setBirthDay}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="birthYear">Birth Year</Label>
                        <Select value={birthYear} onValueChange={setBirthYear}>
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

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailOffers"
                        checked={emailOffers}
                        onCheckedChange={(checked) => setEmailOffers(checked === true)}
                      />
                      <Label htmlFor="emailOffers">Email me with news and offers</Label>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Delivery</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="country">Country/Region</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First name *</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last name *</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="company">Company (optional)</Label>
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company"
                      />
                    </div>

                    <div>
                      <Label htmlFor="streetAddress" className="flex items-center gap-2">
                        Address *
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </Label>
                      <Input
                        id="streetAddress"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Address"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                      <Input
                        id="apartment"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select value={state} onValueChange={setState}>
                          <SelectTrigger>
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP code *</Label>
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="ZIP code"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>We need your phone number for delivery updates and notifications</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveInfo"
                          checked={saveInfo}
                          onCheckedChange={(checked) => setSaveInfo(checked === true)}
                        />
                        <Label htmlFor="saveInfo">Save this information for next time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="textOffers"
                          checked={textOffers}
                          onCheckedChange={(checked) => setTextOffers(checked === true)}
                        />
                        <Label htmlFor="textOffers">Text me with news and offers</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                {shippingRate && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Shipping method</h2>
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="standard"
                            name="shipping"
                            value="standard"
                            checked={selectedShipping === 'standard'}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                          />
                          <Label htmlFor="standard">{shippingRate.zoneName}</Label>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${shippingRate.cost.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{shippingRate.estimatedDays} business days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Payment</h2>
                  {total === 0 ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-foreground">Your order is free. No payment is required.</p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4">
                      <p className="text-muted-foreground">Stripe payment integration would go here</p>
                    </div>
                  )}
                </div>

                {/* Billing Address */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Billing address</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="sameAsBilling"
                        name="billing"
                        checked={sameAsBilling}
                        onChange={() => setSameAsBilling(true)}
                      />
                      <Label htmlFor="sameAsBilling">Same as shipping address</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="differentBilling"
                        name="billing"
                        checked={!sameAsBilling}
                        onChange={() => setSameAsBilling(false)}
                      />
                      <Label htmlFor="differentBilling">Use a different billing address</Label>
                    </div>

                    {!sameAsBilling && (
                      <div className="space-y-4 pl-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingFirstName">First name *</Label>
                            <Input
                              id="billingFirstName"
                              value={billingFirstName}
                              onChange={(e) => setBillingFirstName(e.target.value)}
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingLastName">Last name *</Label>
                            <Input
                              id="billingLastName"
                              value={billingLastName}
                              onChange={(e) => setBillingLastName(e.target.value)}
                              placeholder="Last name"
                            />
                          </div>
                        </div>
                        {/* Additional billing fields would go here */}
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms of Service */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label htmlFor="terms">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary underline">
                        Terms of Service
                      </a>
                    </Label>
                  </div>
                </div>

                {/* Complete Order Button */}
                <Button
                  onClick={handleCompleteOrder}
                  disabled={!isFormValid}
                  className="w-full h-12 text-lg font-semibold"
                >
                  Complete Order
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card shadow-lg sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">Order summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>SIM & Activation Kit</span>
                    <span className="font-medium">FREE</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Router</span>
                    <span className="font-medium">$0 today</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className="font-medium">${planCost}/mo</span>
                  </div>
                  
                  {shippingRate && (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium">${shippingRate.cost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <hr className="border-border" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;