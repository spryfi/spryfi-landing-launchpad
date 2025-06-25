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
  const [isProcessingAddress, setIsProcessingAddress] = useState(false);

  // State name to abbreviation mapping
  const stateNameToAbbrev: { [key: string]: string } = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
  };

  // Enhanced address parsing function
  const parseAddress = (fullAddress: string) => {
    console.log('🔍 Parsing address:', fullAddress);
    
    // Split the address by commas and filter out "United States"
    const parts = fullAddress.split(',').map(part => part.trim()).filter(part => part !== 'United States');
    console.log('📍 Address parts after filtering:', parts);
    
    if (parts.length >= 3) {
      // Extract street address (first part)
      const street = parts[0];
      setAddressLine1(street);
      
      // Extract city (second to last part)
      const cityPart = parts[parts.length - 2];
      setCity(cityPart);
      
      // Extract state and zip from last part
      const lastPart = parts[parts.length - 1];
      console.log('🏛️ Processing last part:', lastPart);
      
      let statePart = '';
      let zipPart = '';
      
      // First, extract ZIP code using a more flexible pattern
      const zipMatch = lastPart.match(/(\d{5}(?:-\d{4})?)/);
      if (zipMatch) {
        zipPart = zipMatch[1];
        console.log('📮 Found ZIP:', zipPart);
        
        // Remove ZIP from string to get state part
        const stateText = lastPart.replace(zipMatch[0], '').trim();
        console.log('🏛️ State text after removing ZIP:', stateText);
        
        // Check if it's already a 2-letter abbreviation
        if (stateText.length === 2 && /^[A-Z]{2}$/.test(stateText.toUpperCase())) {
          statePart = stateText.toUpperCase();
          console.log('✅ Found state abbreviation:', statePart);
        } else {
          // Try to find full state name in our mapping
          const foundState = Object.keys(stateNameToAbbrev).find(stateName => 
            stateName.toLowerCase() === stateText.toLowerCase()
          );
          
          if (foundState) {
            statePart = stateNameToAbbrev[foundState];
            console.log('✅ Converted state name to abbreviation:', stateText, '->', statePart);
          } else {
            console.log('❌ Could not find state mapping for:', stateText);
          }
        }
      } else {
        console.log('❌ No ZIP code found in:', lastPart);
      }
      
      if (statePart && zipPart) {
        setSelectedState(statePart);
        setZipCode(zipPart);
        
        console.log('✅ Address parsed successfully:', {
          addressLine1: street,
          city: cityPart,
          state: statePart,
          zipCode: zipPart
        });
        
        return {
          address_line1: street,
          address_line2: '', // Always include this field
          city: cityPart,
          state: statePart,
          zip_code: zipPart,
          formatted_address: fullAddress
        };
      }
    }
    
    console.error('❌ Failed to parse address:', fullAddress);
    console.error('❌ Address parts:', parts);
    toast({
      title: "Error",
      description: "Could not parse the selected address. Please try selecting a different address from the suggestions.",
    });
    return null;
  };

  // Save address to anchor_address table
  const saveAddressToDatabase = async (parsedAddress: any) => {
    console.log('💾 Saving address to database:', parsedAddress);
    
    try {
      // Check if address already exists
      const { data: existingAddress, error: checkError } = await supabase
        .from('anchor_address')
        .select('id')
        .eq('address_line1', parsedAddress.address_line1)
        .eq('city', parsedAddress.city)
        .eq('state', parsedAddress.state)
        .eq('zip_code', parsedAddress.zip_code)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing address:', checkError);
        throw checkError;
      }

      let anchorAddressId: string;

      if (existingAddress) {
        // Address already exists, use existing ID
        anchorAddressId = existingAddress.id;
        console.log('✅ Using existing address ID:', anchorAddressId);
      } else {
        // Insert new address
        const insertData = {
          address_line1: parsedAddress.address_line1,
          address_line2: parsedAddress.address_line2 || null,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip_code: parsedAddress.zip_code,
          latitude: parsedAddress.latitude || null,
          longitude: parsedAddress.longitude || null,
          status: 'pending'
        };

        console.log('💾 Inserting new address:', insertData);

        const { data: newAddress, error: insertError } = await supabase
          .from('anchor_address')
          .insert(insertData)
          .select('id')
          .single();

        if (insertError) {
          console.error('❌ Error inserting address:', insertError);
          throw insertError;
        }

        anchorAddressId = newAddress.id;
        console.log('✅ Created new address with ID:', anchorAddressId);
      }

      return anchorAddressId;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw error;
    }
  };

  const handleAddressSelect = async (address: string) => {
    console.log('🎯 Address selected:', address);
    setSelectedAddress(address);
    setIsProcessingAddress(true);
    
    try {
      // Parse the address
      const parsedAddress = parseAddress(address);
      
      if (!parsedAddress) {
        return; // Error already shown in parseAddress
      }

      // Save to database
      const anchorAddressId = await saveAddressToDatabase(parsedAddress);
      
      // Update state with address and anchor_address_id
      updateState({
        address: {
          addressLine1: parsedAddress.address_line1,
          addressLine2: parsedAddress.address_line2,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zipCode: parsedAddress.zip_code,
          formattedAddress: address
        },
        anchorAddressId
      });
      
      // Automatically transition to contact form
      setTimeout(() => {
        setShowContactForm(true);
      }, 300);
      
      toast({
        title: "Address confirmed! ✅",
        description: "Now please enter your contact information.",
      });
      
    } catch (error) {
      console.error('🔥 Error processing address:', error);
      toast({
        title: "Error",
        description: "Failed to process the selected address. Please try again.",
      });
    } finally {
      setIsProcessingAddress(false);
    }
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

    if (!state.anchorAddressId) {
      toast({
        title: "Error",
        description: "Address information is not properly saved. Please reselect your address.",
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
          anchor_address_id: state.anchorAddressId
        }
      });

      if (saveLeadError || !saveLeadData?.success) {
        console.error('❌ Save lead error:', saveLeadError);
        throw new Error('Failed to save lead information');
      }

      const leadId = saveLeadData.lead_id;
      console.log('✅ Lead saved with ID:', leadId);

      // Step 2: Check qualification with complete address data
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
          latitude: state.address?.latitude || null,
          longitude: state.address?.longitude || null
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
          phone: ''
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
    <div className="flex justify-center items-start pt-4 px-4" style={{ overflow: 'visible' }}>
      <Card className="w-full max-w-md relative" style={{ overflow: 'visible', zIndex: 30 }}>
        <CardHeader className="px-6 pt-4 pb-2">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2 leading-tight">
            Let's see if we can get you covered! 🎯
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Just enter your address and we'll check if SpryFi is available in your area.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-12 space-y-4 relative" style={{ overflow: 'visible' }}>
          {!showContactForm ? (
            <div className="space-y-2">
              <Label htmlFor="address-search" className="text-sm font-medium text-gray-700">Your Address</Label>
              <div className="relative mb-32 z-40" style={{ overflow: 'visible' }}>
                <SimpleAddressInput
                  onAddressSelect={handleAddressSelect}
                  placeholder="Start typing your address..."
                />
                {isProcessingAddress && (
                  <div className="absolute top-full left-0 right-0 mt-2 text-center">
                    <span className="text-sm text-gray-500">Processing address...</span>
                  </div>
                )}
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
                disabled={isCheckingQualification || !isValidContactInfo() || !state.anchorAddressId}
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
