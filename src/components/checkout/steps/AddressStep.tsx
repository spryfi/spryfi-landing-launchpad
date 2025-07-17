
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  
  // UI state - New two-card flow
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [isCheckingQualification, setIsCheckingQualification] = useState(false);
  const [isProcessingAddress, setIsProcessingAddress] = useState(false);
  
  // Progress tracking
  const [qualificationProgress, setQualificationProgress] = useState(0);
  const [currentStatusMessage, setCurrentStatusMessage] = useState('');

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

  // Enhanced polling with progress and C-BAND detection
  const pollSpryFiStatus = async (requestId: string, maxAttempts: number = 20): Promise<any> => {
    let attempts = 0;
    setQualificationProgress(10);
    setCurrentStatusMessage('Checking SpryFi Databases...');
    
    while (attempts < maxAttempts) {
      try {
        console.log(`📡 Polling SpryFi Database status (attempt ${attempts + 1}/${maxAttempts})`);
        
        // Update progress
        const progress = 10 + (attempts / maxAttempts) * 60; // 10-70% during polling
        setQualificationProgress(progress);
        
        if (attempts < 5) {
          setCurrentStatusMessage('Checking SpryFi Databases...');
        } else if (attempts < 10) {
          setCurrentStatusMessage('Waiting for additional network data...');
        } else {
          setCurrentStatusMessage('Checking SpryFi coverage zones...');
        }
        
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
        console.log('📡 SpryFi Database status response:', statusData);

        // NEW: Stop polling immediately if C-BAND is detected, regardless of qualified status
        if (statusData.network_type === 'C-BAND' && statusData.qualification_status === 'complete') {
          console.log('🎯 C-BAND detected - stopping polling immediately');
          setQualificationProgress(90);
          setCurrentStatusMessage('Result found. Loading...');
          return statusData;
        }

        if (statusData.status === 'complete') {
          console.log('✅ SpryFi Database qualification complete');
          setQualificationProgress(90);
          setCurrentStatusMessage('Result found. Loading...');
          return statusData;
        }

        if (statusData.status === 'failed') {
          console.log('❌ SpryFi Database qualification failed');
          throw new Error('SpryFi Database qualification failed');
        }

        // Still pending, wait 3 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;

      } catch (error) {
        console.error('❌ Error polling status:', error);
        throw error;
      }
    }

    throw new Error('SpryFi Database timeout - exceeded maximum polling attempts');
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
        setIsProcessingAddress(false);
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
      
      // Step 5: Show address confirmed and auto-advance to details card
      setAddressConfirmed(true);
      setIsProcessingAddress(false);
      
      // Wait 1 second then show details card
      setTimeout(() => {
        setShowDetailsCard(true);
      }, 1000);
      
    } catch (error) {
      console.error('🔥 Error processing address:', error);
      toast({
        title: "Address Processing Error",
        description: error instanceof Error ? error.message : "We couldn't process your address — please re-enter it.",
      });
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
    setQualificationProgress(5);
    setCurrentStatusMessage('Initializing...');

    try {
      // Step 1: Save lead to database with anchor_address_id
      console.log('💾 Saving lead to database...');
      setCurrentStatusMessage('Saving your information...');
      
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

      // Step 2: Call SpryFi Databases using Supabase edge function
      console.log('📡 Checking SpryFi Databases...');
      setQualificationProgress(10);
      setCurrentStatusMessage('Checking SpryFi Databases...');
      
      // Log if address was selected from autosuggest
      console.log("📍 Address was selected from autosuggest:", !!selectedAddress);
      console.log("🌍 Raw address string:", selectedAddress);
      
      const fwaCheckPayload = {
        lead_id: leadId,
        anchor_address_id: state.anchorAddressId,
        address_line1: addressLine1,
        address_line2: addressLine2 || '',
        city: city,
        state: selectedState,
        zip_code: zipCode,
        latitude: null,
        longitude: null
      };

      // Log the parsed address payload being sent to fwa-check
      console.log("📦 Parsed address payload being sent to fwa-check:", fwaCheckPayload);

      const { data: databaseData, error: fwaError } = await supabase.functions.invoke('fwa-check', {
        body: fwaCheckPayload
      });

      if (fwaError) {
        console.error('🔥 FWA check error:', fwaError);
        throw new Error(`SpryFi Database call failed: ${fwaError.message}`);
      }

      console.log('📡 SpryFi Database response:', databaseData);

      // The edge function already handles qualification internally (SpryFi Database + Bot fallback)
      if (databaseData.success && databaseData.qualified) {
        console.log('✅ Qualification successful');
        setQualificationProgress(100);
        setCurrentStatusMessage('Success!');
        
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
            source: databaseData.source || 'verizon',
            network_type: databaseData.network_type || '5G_HOME',
            max_speed_mbps: 300
          },
          step: 'qualification-success'
        });

        // Log final saved onboarding state
        console.log("🧠 Final saved onboarding state:", {
          qualified: true,
          address: {
            addressLine1,
            addressLine2,
            city,
            state: selectedState,
            zipCode,
            formattedAddress: selectedAddress
          },
          source: databaseData.source || 'verizon',
          network_type: databaseData.network_type || '5G_HOME'
        });

        toast({
          title: "Great news! 🎉",
          description: "SpryFi is available in your area!",
        });
        return;
      }

      // Not qualified - edge function already tried all options
      console.log('❌ Not qualified after checking all options');
      setQualificationProgress(100);
      setCurrentStatusMessage('Check complete');
      
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
          source: databaseData.source || 'none',
          network_type: '',
          max_speed_mbps: 0
        },
        step: 'not-qualified'
      });

      toast({
        title: "Not in your area — yet",
        description: "We'll notify you when SpryFi becomes available.",
      });

    } catch (error) {
      console.error('🔥 Check area error:', error);
      setQualificationProgress(0);
      setCurrentStatusMessage('');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsCheckingQualification(false);
      // Clear progress after a delay
      setTimeout(() => {
        setQualificationProgress(0);
        setCurrentStatusMessage('');
      }, 2000);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      {!showDetailsCard ? (
        /* Card 1: Address Only */
        <div 
          className="relative rounded-xl overflow-hidden"
          style={{
            width: '480px',
            height: 'auto',
            minHeight: '420px',
            backgroundColor: '#0047AB',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22)'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => {}} // Will be handled by parent modal
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10"
          >
            ×
          </button>

          {/* Address confirmed banner */}
          {addressConfirmed && (
            <div className="absolute top-4 left-4 right-12 bg-green-500/20 border border-green-400 rounded-lg p-3 text-center z-10">
              <div className="flex items-center justify-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span className="font-medium text-sm">Address confirmed:</span>
              </div>
              <div className="text-green-100 text-xs mt-1 truncate">{selectedAddress}</div>
            </div>
          )}

          {/* Content */}
          <div className={`px-6 py-6 h-full flex flex-col justify-center text-center ${addressConfirmed ? 'pt-20' : ''}`}>
            {/* Enhanced SpryFi Branding */}
            <div className="text-center mb-6">
              <div className="text-white text-3xl font-bold mb-2">
                SpryFi
              </div>
              <div className="text-blue-100 text-sm font-medium">
                Internet that just works
              </div>
            </div>

            {/* Preselected Plan Banner */}
            {state.preselectedPlan && !addressConfirmed && (
              <div className="mb-4 bg-green-500/20 border border-green-400 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-white">
                  <span className="text-green-400">✓</span>
                  <span className="font-semibold">
                    {state.preselectedPlan === 'spryfi-home' ? 'Essential' : 'Premium'} Plan Selected
                  </span>
                </div>
                <div className="text-green-100 text-sm mt-1">
                  Sale price locked in forever!
                </div>
              </div>
            )}

            {/* Headline */}
            <h2 className="text-white text-xl font-bold mb-2 leading-tight">
              {addressConfirmed ? (
                <>Perfect! Setting up your details...</>
              ) : state.preselectedPlan ? (
                <>Great! Let's confirm that our SpryFi service<br />is available at your location</>
              ) : (
                <>See if our award-winning internet has arrived<br />in your neighborhood</>
              )}
            </h2>

            {/* Subheadline */}
            {!addressConfirmed && (
              <>
                <p className="text-blue-100 text-base mb-6">
                  {state.preselectedPlan ? 'Enter your address to get started' : 'Simple internet, no runaround'}
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

                {/* Footer */}
                <p className="text-blue-100 text-sm">
                  Results in 10 seconds
                </p>
              </>
            )}
            
            {/* Loading state after address confirmed */}
            {addressConfirmed && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Card 2: User Details */
        <div 
          className="relative rounded-xl overflow-hidden"
          style={{
            width: '480px',
            height: 'auto',
            minHeight: '420px',
            backgroundColor: '#0047AB',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22)'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => {}} // Will be handled by parent modal
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10"
          >
            ×
          </button>

          <div className="h-full p-6 space-y-6">
            {/* Address Confirmed State */}
            <div className="bg-green-500/20 border border-green-400 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span className="font-medium text-sm">Address confirmed:</span>
              </div>
              <div className="text-green-100 text-xs mt-1 truncate">{selectedAddress}</div>
            </div>

            {/* Contact Form Headline */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Almost there
              </h2>
              <p className="text-blue-100">
                Just need a few quick details to check your area.
              </p>
            </div>

            {/* Contact Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-sm font-medium text-white">First Name</Label>
                  <Input
                    type="text"
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white focus:ring-white/30"
                    autoFocus
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-sm font-medium text-white">Last Name</Label>
                  <Input
                    type="text"
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white focus:ring-white/30"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white focus:ring-white/30"
                  required
                />
              </div>
            </div>
            
            {/* Progress Indicator */}
            {isCheckingQualification && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">
                      Checking availability across multiple networks...
                    </span>
                    <span className="text-xs text-blue-100">
                      {Math.round(qualificationProgress)}%
                    </span>
                  </div>
                  <Progress value={qualificationProgress} className="h-2" />
                </div>
                {currentStatusMessage && (
                  <div className="text-center">
                    <p className="text-sm text-blue-100 animate-pulse">
                      {currentStatusMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleCheckArea} 
              className="w-full bg-blue-200 hover:bg-blue-100 text-blue-700 px-8 py-4 text-lg font-medium rounded-lg border-none shadow-sm transition-all duration-200 hover:shadow-md mb-4"
              disabled={isCheckingQualification || !isValidContactInfo() || !state.anchorAddressId}
            >
              {isCheckingQualification ? 'Checking your area...' : 'Check availability'}
            </Button>

            <div className="text-center text-xs text-blue-100">
              {isCheckingQualification ? 'Please wait while we check...' : 'Checking takes 10 seconds'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
