
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
      // Create a new lead record in leads_fresh
      const { data: leadData, error: leadError } = await supabase
        .from('leads_fresh')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          address_line1: state.address?.addressLine1,
          address_line2: state.address?.addressLine2,
          city: state.address?.city,
          state: state.address?.state,
          zip_code: state.address?.zipCode,
          status: 'new',
          lead_type: 'address_check',
          qualified: state.qualified
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
        throw leadError;
      }

      console.log('✅ Lead created successfully:', leadData);
      console.log('✅ Lead ID:', leadData.id);
      console.log('✅ Anchor Address ID:', state.anchorAddressId);

      // Update anchor_address with first_lead_id if we have it
      if (state.anchorAddressId) {
        const { error: updateError } = await supabase
          .from('anchor_address')
          .update({ first_lead_id: leadData.id })
          .eq('id', state.anchorAddressId);

        if (updateError) {
          console.error('Error updating anchor_address:', updateError);
        } else {
          console.log('✅ Anchor address updated with lead ID');
        }
      }

      // Also add to drip_marketing if not qualified
      if (!state.qualified) {
        const { error: dripError } = await supabase
          .from('drip_marketing')
          .upsert({
            email,
            name: `${firstName} ${lastName}`,
            address: state.address?.formattedAddress,
            lead_id: leadData.id,
            qualified: state.qualified,
            status: 'active'
          }, {
            onConflict: 'email'
          });

        if (dripError) {
          console.error('Error updating drip marketing:', dripError);
        } else {
          console.log('✅ Added to drip marketing');
        }
      }

      // Update state with contact info and lead ID
      updateState({
        contact: { email, phone: '' },
        leadId: leadData.id,
        step: state.qualified ? 'qualification-success' : 'not-qualified'
      });

      // Debug output
      console.log('✅ FINAL SUMMARY:');
      console.log('- Lead ID:', leadData.id);
      console.log('- Anchor Address ID:', state.anchorAddressId);
      console.log('- Email:', email);
      console.log('- Name:', `${firstName} ${lastName}`);
      console.log('- Qualified:', state.qualified);
      console.log('- Source:', state.qualificationResult?.source);

    } catch (error) {
      console.error('Error saving contact info:', error);
      alert('Error saving contact information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Almost there — let's get your contact info
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          We'll send you installation instructions and updates
        </p>
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
          {loading ? 'Saving...' : 'Submit'}
        </button>

        {/* Debug info - remove in production */}
        {state.anchorAddressId && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p>Debug: Anchor Address ID: {state.anchorAddressId}</p>
            <p>Qualified: {state.qualified ? 'Yes' : 'No'}</p>
            <p>Source: {state.qualificationResult?.source || 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
