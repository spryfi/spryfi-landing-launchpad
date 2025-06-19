
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface RouterOfferProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const RouterOffer: React.FC<RouterOfferProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);

  const handleRouterSelection = async (addRouter: boolean) => {
    setLoading(true);

    try {
      const newTotal = addRouter ? 25 : 0;

      // Update leads_fresh with router selection (using existing columns)
      await supabase
        .from('leads_fresh')
        .update({
          status: 'router_offered'
        })
        .eq('id', state.leadId);

      updateState({
        step: 'checkout',
        routerAdded: addRouter,
        totalAmount: newTotal
      });
    } catch (error) {
      console.error('Error updating router selection:', error);
      alert('Error processing selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📡</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Setup
        </h2>
        <p className="text-gray-600">
          Add our AI-powered WiFi 6E router for the best experience
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="border-2 border-red-200 rounded-xl p-6 bg-gradient-to-br from-red-50 to-pink-50 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">WiFi 6E Tri-Band Router</h3>
              <div className="text-sm text-red-600 font-semibold">LIMITED TIME OFFER</div>
            </div>
            <div className="text-right">
              <div className="text-lg line-through text-gray-400">$299</div>
              <div className="text-3xl font-bold text-red-600">$25</div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            Includes AI tuning to auto-optimize your WiFi for your home layout, devices, and usage.
          </p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              WiFi 6E with 6GHz band
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              AI-powered optimization
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Easy plug-and-play setup
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Covers up to 3,000 sq ft
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleRouterSelection(true)}
            disabled={loading}
            className="w-full py-4 text-lg font-semibold rounded-lg"
            style={{
              background: 'linear-gradient(90deg, #D72638 0%, #8B0000 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            {loading ? 'Processing...' : 'Add Router - $25'}
          </Button>

          <Button
            onClick={() => handleRouterSelection(false)}
            disabled={loading}
            variant="outline"
            className="w-full py-4 text-lg font-semibold rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Skip Router - Continue
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          You can always add or upgrade equipment later
        </p>
      </div>
    </div>
  );
};
