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

  // Enhanced address parsing function with better validation
  const parseAddress = (fullAddress: string) => {
    console.log('🔍 Parsing address:', fullAddress);
    
    // Split the address by commas and filter out "United States"
    const parts = fullAddress.split(',').map(part => part.trim()).filter(part => part !== 'United States');
    console.log('📍 Address parts after filtering:', parts);
    
    if (parts.length < 3) {
      console.error('❌ Address has insufficient parts:', parts.length);
      return null;
    }

    // Extract street address (first part)
    const street = parts[0];
    if (!street || street.trim() === '') {
      console.error('❌ Missing street address');
      return null;
    }
    
    // Extract city (second to last part)
    const cityPart = parts[parts.length - 2];
    if (!cityPart || cityPart.trim() === '') {
      console.error('❌ Missing city');
      return null;
    }
    
    // Extract state and zip from last part
    const lastPart = parts[parts.length - 1];
    console.log('🏛️ Processing last part:', lastPart);
    
    let statePart = '';
    let zipPart = '';
    
    // Extract ZIP code using flexible pattern (5 digits or 5+4 format)
    const zipMatch = lastPart.match(/(\d{5}(?:-\d{4})?)/);
    if (zipMatch) {
      zipPart = zipMatch[1];
      console.log('📮 Found ZIP:', zipPart);
      
      // Remove ZIP from string to get state part
      const stateText = lastPart.replace(zipMatch[0], '').trim();
      console.log('🏛️ State text after removing ZIP:', stateText);
      
      // Check if it's already a 2-letter abbreviation
      if (stateText.length === 2 && /^[A-Z]{2}$/i.test(stateText)) {
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
          return null;
        }
      }
    } else {
      console.log('❌ No ZIP code found in:', lastPart);
      return null;
    }
    
    // Validate all required fields are present
    if (!street || !cityPart || !statePart || !zipPart) {
      console.error('❌ Missing required address fields:', {
        street: !!street,
        city: !!cityPart,
        state: !!statePart,
        zip: !!zipPart
      });
      return null;
    }

    const payload = {
      address_line1: street,
      address_line2: '', // Always include this field
      city: cityPart,
      state: statePart,
      zip_code: zipPart,
      formatted_address: fullAddress,
      latitude: null, // Will be set if available from geocoding
      longitude: null // Will be set if available from geocoding
    };

    console.log('✅ Address parsed successfully:', payload);
    return payload;
  };

  // Save address to anchor_address table with proper error handling
  const saveAddressToDatabase = async (parsedAddress: any) => {
    console.log('💾 Saving address to database:', parsedAddress);
    
    try {
      // Validate payload before saving
      if (!parsedAddress.address_line1 || !parsedAddress.city || !parsedAddress.state || !parsedAddress.zip_code) {
        throw new Error('Missing required address fields');
      }

      // Use upsert to handle existing addresses
      const { data: anchor, error: upsertError } = await supabase
        .from('anchor_address')
        .upsert({
          address_line1: parsedAddress.address_line1,
          address_line2: parsedAddress.address_line2 || null,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip_code: parsedAddress.zip_code,
          latitude: parsedAddress.latitude || null,
          longitude: parsedAddress.longitude || null,
          status: 'pending'
        }, { 
          onConflict: 'address_line1,city,state,zip_code',
          ignoreDuplicates: false 
        })
        .select('id')
        .single();

      if (upsertError) {
        console.error('❌ Error upserting address:', upsertError);
        throw new Error(`Failed to save address: ${upsertError.message}`);
      }

      if (!anchor || !anchor.id) {
        throw new Error('Address saved but no ID returned');
      }

      const anchorAddressId = anchor.id;
      console.log('✅ Address saved/found with ID:', anchorAddressId);
      return anchorAddressId;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw error;
    }
  };

  // Poll Verizon API status
  const pollVerizonStatus = async (requestId: string, maxAttempts: number = 20): Promise<any> => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`📡 Polling Verizon status (attempt ${attempts + 1}/${maxAttempts})`);
        
        const statusResponse = await fetch(`https://fwa.spry.network/api/fwa-status/${requestId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!statusResponse.ok) {
          console.error('❌ Status polling failed:', statusResponse.status);
          throw new Error('Status polling failed');
        }

        const statusData = await statusResponse.json();
        console.log('📡 Verizon status response:', statusData);

        if (statusData.status === 'complete') {
          console.log('✅ Verizon qualification complete');
          return statusData;
        }

        if (statusData.status === 'failed') {
          console.log('❌ Verizon qualification failed');
          throw new Error('Verizon qualification failed');
        }

        // Still pending, wait 3 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;

      } catch (error) {
        console.error('❌ Error polling status:', error);
        throw error;
      }
    }

    throw new Error('Verizon API timeout - exceeded maximum polling attempts');
  };

  const handleAddressSelect = async (address: string) => {
    console.log('🎯 Address selected:', address);
    setSelectedAddress(address);
    setIsProcessingAddress(true);
    
    try {
      // Step 1: Parse the address with validation
      const parsedAddress = parseAddress(address);
      
      if (!parsedAddress) {
        toast({
          title: "Address Error",
          description: "We couldn't process your address — please re-enter it or try a different address.",
        });
        return;
      }

      console.log('📬 Address parsed and saved:', parsedAddress);

      // Step 2: Set the parsed address fields in state
      setAddressLine1(parsedAddress.address_line1);
      setAddressLine2(parsedAddress.address_line2);
      setCity(parsedAddress.city);
      setSelectedState(parsedAddress.state);
      setZipCode(parsedAddress.zip_code);

      // Step 3: Save to database and get the anchor_address_id
      const anchorAddressId = await saveAddressToDatabase(parsedAddress);
      console.log('🔗 Linked lead to address:', anchorAddressId);
      
      // Step 4: Update checkout state with address and anchor_address_id
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
      
      // Step 5: Automatically transition to contact form
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
        title: "Address Processing Error",
        description: error instanceof Error ? error.message : "We couldn't process your address — please re-enter it.",
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
        title: "Address Error",
        description: "Address information is not properly saved. Please reselect your address.",
      });
      return;
    }

    setIsCheckingQualification(true);

    try {
      // Step 1: Save lead to database with anchor_address_id
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

      // Step 2: Call Verizon API
      console.log('📡 Calling Verizon API...');
      
      const verizonPayload = {
        address_line1: addressLine1,
        address_line2: addressLine2 || '',
        city: city,
        state: selectedState,
        zip_code: zipCode,
        formatted_address: selectedAddress
      };

      const verizonResponse = await fetch('https://fwa.spry.network/api/fwa-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verizonPayload)
      });

      if (!verizonResponse.ok) {
        throw new Error('Verizon API call failed');
      }

      const verizonData = await verizonResponse.json();
      console.log('📡 Verizon API initial response:', verizonData);

      // Step 3: Handle Verizon response based on status
      if (verizonData.status === 'pending' && verizonData.request_id) {
        // Poll for completion
        console.log('⏳ Verizon response pending, starting polling...');
        
        try {
          const finalVerizonResult = await pollVerizonStatus(verizonData.request_id);
          
          if (finalVerizonResult.qualified === true) {
            // Verizon qualified - sapi1
            console.log('✅ Verizon qualification successful - sapi1');
            
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
              qualified: true,
              qualificationResult: {
                source: 'verizon',
                network_type: finalVerizonResult.network_type || 'C-BAND',
                max_speed_mbps: 300
              },
              step: 'qualification-success'
            });

            toast({
              title: "Great news! 🎉",
              description: "SpryFi is available in your area!",
            });
            return;
          } else {
            // Verizon said not qualified, try bot fallback
            console.log('❌ Verizon not qualified after polling, trying bot fallback...');
          }
        } catch (pollError) {
          console.log('❌ Verizon polling failed, trying bot fallback...', pollError);
        }
      } else if (verizonData.qualified === true) {
        // Immediate qualification
        console.log('✅ Verizon qualification successful (immediate) - sapi1');
        
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
          qualified: true,
          qualificationResult: {
            source: 'verizon',
            network_type: verizonData.network_type || 'C-BAND',
            max_speed_mbps: 300
          },
          step: 'qualification-success'
        });

        toast({
          title: "Great news! 🎉",
          description: "SpryFi is available in your area!",
        });
        return;
      }

      // Step 4: Verizon failed/not qualified, try bot fallback
      console.log('❌ Verizon not qualified, trying bot fallback...');
      
      const botResponse = await fetch('https://fwa.spry.network/api/bot-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verizonPayload)
      });

      if (!botResponse.ok) {
        throw new Error('Bot API call failed');
      }

      const botData = await botResponse.json();
      console.log('🤖 Bot API response:', botData);

      if (botData.qualified === true) {
        // Bot qualified - sapi2
        console.log('✅ Bot qualification successful - sapi2');
        
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
          qualified: true,
          qualificationResult: {
            source: 'bot',
            network_type: botData.network_type || '5G_HOME',
            max_speed_mbps: botData.max_speed_mbps || 200
          },
          step: 'qualification-success'
        });

        toast({
          title: "Great news! 🎉",
          description: "SpryFi is available in your area!",
        });
        return;
      }

      // Both failed - not qualified
      console.log('❌ Both Verizon and Bot said not qualified');
      
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
        qualified: false,
        qualificationResult: {
          source: 'none',
          network_type: '',
          max_speed_mbps: 0
        },
        step: 'contact'
      });

      toast({
        title: "Not in your area — yet",
        description: "We'll notify you when SpryFi becomes available.",
      });

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="relative rounded-xl overflow-hidden"
        style={{
          width: '480px',
          height: '320px',
          backgroundColor: '#0047AB'
        }}
      >
        {!showContactForm ? (
          <>
            {/* Close button */}
            <button
              onClick={() => {}} // Will be handled by parent modal
              className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10"
            >
              ×
            </button>

            {/* Content */}
            <div className="px-6 py-6 h-full flex flex-col justify-center text-center">
              {/* Enhanced SpryFi Branding */}
              <div className="text-center mb-6">
                {/* Larger, bolder SpryFi logo */}
                <div className="text-white text-3xl font-bold mb-2">
                  SpryFi
                </div>
                
                {/* Tagline */}
                <div className="text-blue-100 text-sm font-medium">
                  Internet that just works
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-white text-xl font-bold mb-2 leading-tight">
                See if our award-winning internet has arrived<br />
                in your neighborhood
              </h2>

              {/* Subheadline */}
              <p className="text-blue-100 text-base mb-6">
                Simple internet, no runaround
              </p>

              {/* Input with SimpleAddressInput functionality */}
              <div className="relative z-40 mb-4" style={{ overflow: 'visible' }}>
                <SimpleAddressInput
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter your street address"
                />
                {isProcessingAddress && (
                  <div className="absolute top-full left-0 right-0 mt-1 text-center">
                    <span className="text-xs text-blue-100">Processing...</span>
                  </div>
                )}
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  if (selectedAddress) {
                    setShowContactForm(true);
                  }
                }}
                disabled={!selectedAddress || isProcessingAddress}
                className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors mb-4 disabled:opacity-50"
              >
                Check my address
              </button>

              {/* Footer */}
              <p className="text-blue-100 text-sm">
                Results in 10 seconds
              </p>
            </div>
          </>
        ) : (
          <div className="h-full bg-white rounded-lg p-6 space-y-6">
            {/* Address Confirmed State */}
            <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✅</span>
                <span className="font-medium">Address confirmed:</span>
              </div>
              <div className="text-gray-700 text-xs">{selectedAddress}</div>
            </div>

            {/* Contact Form Headline */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                Almost there
              </h2>
              <p className="text-gray-600">
                Just need a few quick details to check your area.
              </p>
            </div>

            {/* Contact Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    type="text"
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-11 text-base border-gray-200 focus:border-[#0047AB] focus:ring-[#0047AB]"
                    autoFocus
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    type="text"
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-11 text-base border-gray-200 focus:border-[#0047AB] focus:ring-[#0047AB]"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-11 text-base border-gray-200 focus:border-[#0047AB] focus:ring-[#0047AB]"
                  required
                />
              </div>
            </div>
            
            <Button 
              onClick={handleCheckArea} 
              className="w-full bg-[#0047AB] hover:bg-[#003a94] text-white px-8 py-4 text-lg font-medium rounded-lg border-none shadow-sm transition-all duration-200 hover:shadow-md mb-4"
              disabled={isCheckingQualification || !isValidContactInfo() || !state.anchorAddressId}
            >
              {isCheckingQualification ? 'Checking your area...' : 'Check availability'}
            </Button>

            <div className="text-center text-xs text-gray-400">
              Checking takes 10 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
