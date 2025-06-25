
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
import { supabase } from '@/integrations/supabase/client';

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
  
  // Contact information
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  // UI state
  const [isCheckingQualification, setIsCheckingQualification] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

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
    
    // Automatically transition to contact form
    setTimeout(() => {
      setShowContactForm(true);
    }, 300);
  };

  const isValidAddress = () => {
    return addressLine1.trim() !== '' && city.trim() !== '' && selectedState !== '' && zipCode.trim() !== '';
  };

  const isValidContactInfo = () => {
    return firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && email.includes('@');
  };

  const handleCheckArea = async () => {
    if (!selectedAddress) {
      toast({
        title: "Error",
        description: "Please select an address from the suggestions.",
      });
      return;
    }

    if (!isValidAddress()) {
      toast({
        title: "Error",
        description: "Please ensure all address fields are filled.",
      });
      return;
    }

    if (!isValidContactInfo()) {
      toast({
        title: "Error",
        description: "Please fill in your first name, last name, and email address.",
      });
      return;
    }

    setIsCheckingQualification(true);

    try {
      // Step 1: Save lead to database
      console.log('💾 Saving lead to database...');
      const { data: saveLeadData, error: saveLeadError } = await supabase.functions.invoke('save-lead', {
        body: {
          email,
          first_name: firstName,
          last_name: lastName,
          anchor_address_id: null // Will be created by fwa-check
        }
      });

      if (saveLeadError || !saveLeadData?.success) {
        console.error('❌ Save lead error:', saveLeadError);
        throw new Error('Failed to save lead information');
      }

      const leadId = saveLeadData.lead_id;
      console.log('✅ Lead saved with ID:', leadId);

      // Step 2: Check qualification
      console.log('🔍 Checking area qualification...');
      const { data: qualificationData, error: qualificationError } = await supabase.functions.invoke('fwa-check', {
        body: {
          lead_id: leadId,
          formatted_address: selectedAddress,
          address_line1: addressLine1,
          address_line2: addressLine2 || null,
          city,
          state: selectedState,
          zip_code: zipCode,
          latitude: null, // Could be enhanced with geocoding
          longitude: null
        }
      });

      if (qualificationError) {
        console.error('❌ Qualification check error:', qualificationError);
        throw new Error('Failed to check area qualification');
      }

      console.log('✅ Qualification check complete:', qualificationData);

      // Update state with results and move to next step
      updateState({
        address: {
          addressLine1,
          addressLine2,
          city,
          state: selectedState,
          zipCode,
          formattedAddress: selectedAddress
        },
        contact: {
          firstName,
          lastName,
          email,
          phone: '' // Add empty phone to satisfy interface
        },
        leadId,
        qualified: qualificationData.qualified,
        qualificationResult: {
          source: qualificationData.source,
          network_type: qualificationData.network_type,
          max_speed_mbps: qualificationData.raw_data?.max_speed_mbps
        },
        step: qualificationData.qualified ? 'qualification-success' : 'contact'
      });

      if (qualificationData.qualified) {
        toast({
          title: "Great news! 🎉",
          description: "SpryFi is available in your area!",
        });
      } else {
        toast({
          title: "Not in your area — yet",
          description: "We'll notify you when SpryFi becomes available.",
        });
      }

    } catch (error) {
      console.error('🔥 Check area error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsCheckingQualification(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-4 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2 leading-tight">
            Let's see if we can get you covered! 🎯
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Just enter your address and we'll check if SpryFi is available in your area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showContactForm ? (
            <div className="space-y-2">
              <Label htmlFor="address-search" className="text-sm">Your Address</Label>
              <div className="relative mb-10 z-20">
                <SimpleAddressInput
                  onAddressSelect={handleAddressSelect}
                  placeholder="Start typing your address..."
                />
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-500">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="font-medium">Address confirmed:</span>
                </div>
                <div className="text-gray-700 mt-1">{selectedAddress}</div>
              </div>
              
              <div className="space-y-4 mt-6" id="contact-info-form">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-sm">First Name</Label>
                  <Input
                    type="text"
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-9 text-sm"
                    autoFocus
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-sm">Last Name</Label>
                  <Input
                    type="text"
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-9 text-sm"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="h-9 text-sm"
                    required
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCheckArea} 
                className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-700 font-semibold"
                disabled={isCheckingQualification || !isValidContactInfo()}
              >
                {isCheckingQualification ? 'Checking Your Area...' : 'Check My Area'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
