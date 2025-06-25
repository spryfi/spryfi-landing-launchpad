import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { states } from '@/constants/states';
import { toast } from "@/components/ui/use-toast"
import { CheckoutState } from '../CheckoutModal';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [addressLine1, setAddressLine1] = useState<string>(localStorage.getItem('addressFormData')?.length ? JSON.parse(localStorage.getItem('addressFormData') || '{}').addressLine1 : '');
  const [addressLine2, setAddressLine2] = useState<string>(localStorage.getItem('addressFormData')?.length ? JSON.parse(localStorage.getItem('addressFormData') || '{}').addressLine2 : '');
  const [city, setCity] = useState<string>(localStorage.getItem('addressFormData')?.length ? JSON.parse(localStorage.getItem('addressFormData') || '{}').city : '');
  const [selectedState, setSelectedState] = useState<string>(localStorage.getItem('addressFormData')?.length ? JSON.parse(localStorage.getItem('addressFormData') || '{}').selectedState : '');
  const [zipCode, setZipCode] = useState<string>(localStorage.getItem('addressFormData')?.length ? JSON.parse(localStorage.getItem('addressFormData') || '{}').zipCode : '');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressLine1(e.target.value);
  };

  const handleAddress2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressLine2(e.target.value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const isValidAddress = () => {
    return addressLine1.trim() !== '' && city.trim() !== '' && selectedState !== '' && zipCode.trim() !== '';
  };

  const handleQualificationCheck = async () => {
    if (!isValidAddress()) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
      })
      return;
    }

    // Save address form data to local storage
    const addressFormData = {
      addressLine1,
      addressLine2,
      city,
      selectedState,
      zipCode,
    };
    localStorage.setItem('addressFormData', JSON.stringify(addressFormData));

    // Call the edge function to check qualification
    const apiUrl = `/api/fwa-check`;

    const payload = {
      address_line1: addressLine1,
      address_line2: addressLine2,
      city: city,
      state: selectedState,
      zip_code: zipCode,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.qualified) {
        console.log('✅ Qualification check result:', data);
        updateState({ 
          qualified: true,
          qualificationResult: {
            source: data.source, // Use the source from API response
            network_type: data.network_type,
            max_speed_mbps: data.max_speed_mbps || 300
          },
          step: 'qualification-success' 
        });
      } else {
        console.log('❌ Address not qualified');
        updateState({ qualified: false, step: 'not-qualified' });
      }
    } catch (error) {
      console.error('Error during qualification check:', error);
      toast({
        title: "Error",
        description: "Failed to check address qualification. Please try again.",
      })
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-[550px]">
        <CardHeader>
          <CardTitle>Check Internet Availability</CardTitle>
          <CardDescription>Enter your address to see if SpryFi is available in your area.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              placeholder="1234 Main St"
              value={addressLine1}
              onChange={handleAddressChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address2">Address 2 (Optional)</Label>
            <Input
              type="text"
              id="address2"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={addressLine2}
              onChange={handleAddress2Change}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              placeholder="New York"
              value={city}
              onChange={handleCityChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select onValueChange={handleStateChange} defaultValue={selectedState}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select" />
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
            <div className="grid gap-2">
              <Label htmlFor="zipcode">Zip Code</Label>
              <Input
                type="text"
                id="zipcode"
                placeholder="10001"
                value={zipCode}
                onChange={handleZipCodeChange}
              />
            </div>
          </div>
          <Button onClick={handleQualificationCheck} className="w-full">Check Availability</Button>
        </CardContent>
      </Card>
    </div>
  );
};
