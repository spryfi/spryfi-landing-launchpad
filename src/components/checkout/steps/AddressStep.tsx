
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
import { toast } from "@/hooks/use-toast"
import { CheckoutState } from '../CheckoutModal';
import SimpleAddressInput from '@/components/SimpleAddressInput';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');

  // Parse the selected address and populate individual fields
  const parseAddress = (fullAddress: string) => {
    console.log('🔍 Parsing address:', fullAddress);
    
    // Split the address by commas
    const parts = fullAddress.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      // Extract street address (first part)
      setAddressLine1(parts[0]);
      
      // Extract city (second to last part)
      setCity(parts[parts.length - 2]);
      
      // Extract state and zip from last part
      const lastPart = parts[parts.length - 1];
      const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
      
      if (stateZipMatch) {
        setSelectedState(stateZipMatch[1]);
        setZipCode(stateZipMatch[2]);
      }
      
      console.log('✅ Address parsed:', {
        addressLine1: parts[0],
        city: parts[parts.length - 2],
        state: stateZipMatch?.[1],
        zipCode: stateZipMatch?.[2]
      });
    }
  };

  const handleAddressSelect = (address: string) => {
    console.log('🎯 Address selected:', address);
    setSelectedAddress(address);
    parseAddress(address);
  };

  const isValidAddress = () => {
    return addressLine1.trim() !== '' && city.trim() !== '' && selectedState !== '' && zipCode.trim() !== '';
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      toast({
        title: "Error",
        description: "Please select an address from the suggestions.",
      })
      return;
    }

    if (!isValidAddress()) {
      toast({
        title: "Error",
        description: "Please ensure all address fields are filled.",
      })
      return;
    }

    // Save address to state and move to contact step
    updateState({
      address: {
        addressLine1,
        addressLine2,
        city,
        state: selectedState,
        zipCode,
        formattedAddress: selectedAddress
      },
      step: 'contact'
    });
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-8">
      <Card className="w-[550px] min-h-[600px]">
        <CardHeader>
          <CardTitle>Check Internet Availability</CardTitle>
          <CardDescription>Enter your address to see if SpryFi is available in your area.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="address-search">Address</Label>
            <SimpleAddressInput
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing your address..."
            />
          </div>
          
          {selectedAddress && (
            <>
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                Selected: {selectedAddress}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  type="text"
                  id="address"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="1234 Main St"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address2">Address 2 (Optional)</Label>
                <Input
                  type="text"
                  id="address2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Select onValueChange={setSelectedState} value={selectedState}>
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
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>
              
              <Button onClick={handleContinue} className="w-full">
                Check Availability
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
