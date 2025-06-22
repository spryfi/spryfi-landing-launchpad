
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
      // Call the save-lead edge function
      const { data, error } = await supabase.functions.invoke('save-lead', {
        body: {
          email,
          first_name: firstName,
          last_name: lastName,
          started_at: new Date().toISOString() // Set started timestamp
        }
      });

      if (error) {
        console.error('Error saving lead:', error);
        throw error;
      }

      console.log('✅ Lead saved successfully:', data);
      console.log('✅ Lead ID:', data.lead_id);

      // Update state with contact info and lead ID, then move to address step
      updateState({
        contact: { 
          email, 
          phone: '', 
          firstName,
          lastName 
        },
        leadId: data.lead_id,
        step: 'address'
      });

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
        <div className="text-6xl mb-4">👋</div>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-4">
          Let's get you started — just tell us who you are
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          We'll use this info to track your order and keep you updated
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
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
