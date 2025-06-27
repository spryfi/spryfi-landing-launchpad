
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface ContactStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const ContactStep: React.FC<ContactStepProps> = ({ state, updateState }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter your first and last name');
      return;
    }

    setLoading(true);

    try {
      // Call the save-lead edge function with explicit CORS mode
      const { data, error } = await supabase.functions.invoke('save-lead', {
        body: {
          email,
          first_name: firstName,
          last_name: lastName,
          started_at: new Date().toISOString(),
          status: 'started'
        }
      });

      if (error) {
        console.error('Error saving lead:', error);
        throw error;
      }

      console.log('✅ Lead saved successfully:', data);
      console.log('✅ Lead ID:', data.lead_id);

      // Update state with contact info and lead ID
      updateState({
        contact: { 
          email, 
          phone: '', 
          firstName,
          lastName 
        },
        leadId: data.lead_id
      });

      // Now run the qualification check
      await runQualificationCheck(data.lead_id);

    } catch (error) {
      console.error('❌ Save lead error:', error);
      
      // Check for CORS error specifically
      if (error?.message?.includes("Access-Control-Allow-Origin") || 
          error?.message?.includes("CORS") ||
          error?.message?.includes("cross-origin")) {
        console.error("❌ CORS error on save-lead function", error);
        alert("Something's wrong on our end. We're fixing it — try again shortly.");
      } else {
        console.error("❌ Save lead error:", error);
        alert("Something went wrong while saving your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const runQualificationCheck = async (leadId: string) => {
    if (!state.address) return;

    try {
      console.log('🔍 Starting qualification check...');

      // Call the FWA check API with lead_id
      const { data, error } = await supabase.functions.invoke('fwa-check', {
        body: {
          lead_id: leadId,
          formatted_address: state.address.formattedAddress,
          address_line1: state.address.addressLine1,
          address_line2: state.address.addressLine2 || '',
          city: state.address.city,
          state: state.address.state,
          zip_code: state.address.zipCode,
          latitude: state.address.latitude || 0,
          longitude: state.address.longitude || 0,
          google_place_id: state.address.googlePlaceId || ''
        }
      });

      if (error) {
        console.error('FWA check error:', error);
        alert('Error checking address availability. Please try again.');
        return;
      }

      console.log('✅ Qualification check result:', data);

      // Update state with qualification results
      updateState({
        qualified: data.qualified,
        anchorAddressId: data.anchor_address_id,
        qualificationResult: {
          source: data.source || 'none',
          network_type: data.network_type,
          max_speed_mbps: data.raw_data?.max_speed_mbps
        }
      });

      // Move to next step based on qualification
      if (data.qualified) {
        updateState({ step: 'qualification-success' });
      } else {
        updateState({ step: 'not-qualified' });
      }

    } catch (error) {
      console.error('Error during qualification check:', error);
      alert('Error checking address availability. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        {/* Enhanced SpryFi Branding */}
        <div className="text-center mb-6">
          <div className="text-[#0047AB] text-3xl font-bold mb-2">
            SpryFi
          </div>
          <div className="text-gray-600 text-sm font-medium">
            Internet that just works
          </div>
        </div>

        <div className="text-6xl mb-4">👋</div>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Great! Now tell us who you are
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          We'll use this info to track your order and keep you updated
        </p>
        {state.address && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Service Address:</strong> {state.address.formattedAddress || 
              `${state.address.addressLine1}, ${state.address.city}, ${state.address.state} ${state.address.zipCode}`}
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>

        <div>
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>

        <div>
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!email || !firstName || !lastName || loading}
          className="w-full bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold py-3 px-6 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking availability...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
