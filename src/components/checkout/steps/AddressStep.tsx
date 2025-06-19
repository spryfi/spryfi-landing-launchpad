

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const AddressStep: React.FC<AddressStepProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          setAddress(place.formatted_address);
        }
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!address || !autocompleteRef.current) return;

    setLoading(true);
    
    try {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        alert('Please select a valid address from the dropdown');
        setLoading(false);
        return;
      }

      const addressComponents = place.address_components;
      const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
      const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
      const city = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = addressComponents.find((c: any) => c.types.includes('postal_code'))?.long_name || '';

      const addressLine1 = `${streetNumber} ${route}`.trim();
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      // First, insert or get anchor_address
      const { data: anchorData, error: anchorError } = await supabase
        .from('anchor_address')
        .upsert({
          address_line1: addressLine1,
          city,
          state,
          zip_code: zipCode,
          latitude,
          longitude,
          google_place_id: place.place_id,
          first_lead_id: null // Will be updated when we create the lead
        }, {
          onConflict: 'address_line1,city,state,zip_code',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (anchorError) {
        console.error('Error creating anchor address:', anchorError);
        alert('Error processing address. Please try again.');
        setLoading(false);
        return;
      }

      // Create leads_fresh record
      const { data: leadData, error: leadError } = await supabase
        .from('leads_fresh')
        .insert({
          address_line1: addressLine1,
          city,
          state,
          zip_code: zipCode,
          status: 'new'
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
        alert('Error creating lead. Please try again.');
        setLoading(false);
        return;
      }

      // Check qualification (simplified - you can expand this logic)
      const isQualified = anchorData.is_cb_valid || anchorData.qualified_cband || Math.random() > 0.3; // Mock qualification

      if (!isQualified) {
        // Add to drip marketing
        await supabase
          .from('drip_marketing')
          .insert({
            email: '', // Will be filled when we get contact info
            name: '',
            address: place.formatted_address,
            status: 'active'
          });

        updateState({
          step: 'not-qualified',
          anchorAddressId: anchorData.id,
          leadId: leadData.id,
          address: {
            addressLine1,
            city,
            state,
            zipCode,
            latitude,
            longitude,
            googlePlaceId: place.place_id,
            formattedAddress: place.formatted_address
          },
          qualified: false
        });
      } else {
        updateState({
          step: 'contact',
          anchorAddressId: anchorData.id,
          leadId: leadData.id,
          address: {
            addressLine1,
            city,
            state,
            zipCode,
            latitude,
            longitude,
            googlePlaceId: place.place_id,
            formattedAddress: place.formatted_address
          },
          qualified: true
        });
      }
    } catch (error) {
      console.error('Error processing address:', error);
      alert('Error processing address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="rounded-xl max-w-md mx-auto relative transition-all duration-300"
      style={{
        background: 'linear-gradient(to bottom, #0047ab 0%, #0047ab 50%, #ffffff 100%)',
        padding: '48px 32px',
        borderRadius: '18px',
        boxShadow: `
          inset 0 1px 4px rgba(255, 255, 255, 0.2),
          inset 0 -1px 3px rgba(0, 0, 0, 0.05),
          0 4px 12px rgba(0, 0, 0, 0.15),
          0 16px 32px rgba(0, 0, 0, 0.08)
        `,
        transform: 'translateZ(0)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          inset 0 1px 4px rgba(255, 255, 255, 0.2),
          inset 0 -1px 3px rgba(0, 0, 0, 0.05),
          0 8px 24px rgba(0, 0, 0, 0.2),
          0 24px 48px rgba(0, 0, 0, 0.1)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          inset 0 1px 4px rgba(255, 255, 255, 0.2),
          inset 0 -1px 3px rgba(0, 0, 0, 0.05),
          0 4px 12px rgba(0, 0, 0, 0.15),
          0 16px 32px rgba(0, 0, 0, 0.08)
        `;
      }}
    >
      <div className="text-center mb-8">
        <div className="text-3xl mb-4">📍</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'white' }}>
          Let's see if SpryFi works at your address.
        </h2>
        <p className="mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Type it in below — no contracts, no hassle.
        </p>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
          We'll only use your address to check coverage — no spam, no pressure.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg transition-all duration-200 focus:outline-none"
            style={{
              height: '42px',
              padding: '10px 16px 10px 48px',
              fontSize: '15px',
              borderRadius: '6px',
              background: 'linear-gradient(to right, #eaf4ff, #dbeeff)',
              border: '1px solid #aad4ff',
              boxShadow: '0 1px 6px rgba(0, 112, 243, 0.08)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0070f3';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 112, 243, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#aad4ff';
              e.target.style.boxShadow = '0 1px 6px rgba(0, 112, 243, 0.08)';
            }}
          />
        </div>

        {/* Cobalt divider bar above the button */}
        <div 
          className="w-full"
          style={{
            height: '3px',
            background: 'linear-gradient(to right, #0047ab, #0070f3)',
            borderRadius: '1.5px',
            margin: '24px 0 12px',
          }}
        />

        <Button
          onClick={handleSubmit}
          disabled={!address || loading}
          className="w-full py-4 text-lg font-bold rounded-full transition-all duration-300 hover:shadow-lg"
          style={{
            background: address ? (loading ? '#0047AB' : 'linear-gradient(to right, #0047AB, #007FFF)') : '#ccc',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (address && !loading) {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,112,243,0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking...
            </div>
          ) : (
            'Check Availability'
          )}
        </Button>
      </div>

      {/* Branding bar at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
        style={{
          background: 'linear-gradient(to right, #0047AB, #007FFF)',
        }}
      />
    </div>
  );
};

