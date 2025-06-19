
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
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!validatePhone(phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      // Update leads_fresh with contact info
      await supabase
        .from('leads_fresh')
        .update({
          email,
          phone
        })
        .eq('id', state.leadId);

      // Update drip_marketing if it exists
      await supabase
        .from('drip_marketing')
        .update({
          email,
          name: `${email.split('@')[0]}` // Simple name extraction
        })
        .eq('address', state.address?.formattedAddress);

      updateState({
        step: 'qualification-success',
        contact: { email, phone }
      });
    } catch (error) {
      console.error('Error updating contact info:', error);
      alert('Error saving contact information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Stay in the loop and get your setup guide!
        </h2>
        <p className="text-gray-600">
          We'll send you installation instructions and updates
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>

        <div>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-lg p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!email || !phone || loading}
          className="w-full py-4 text-lg font-semibold rounded-lg"
          style={{
            background: email && phone ? '#0047AB' : '#ccc',
            color: 'white'
          }}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
