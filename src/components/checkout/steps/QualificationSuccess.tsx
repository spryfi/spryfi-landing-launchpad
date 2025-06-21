
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutState } from '../CheckoutModal';
import { QualificationBadge } from '@/components/QualificationBadge';

interface QualificationSuccessProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const QualificationSuccess: React.FC<QualificationSuccessProps> = ({ state, updateState }) => {
  const handleContinue = () => {
    updateState({ step: 'plan-selection' });
  };

  return (
    <div className="p-8 text-center relative">
      {/* Qualification Source Badge */}
      <div className="absolute top-4 right-4">
        <QualificationBadge 
          source={state.qualificationResult?.source || 'none'} 
        />
      </div>

      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Great news!
      </h2>
      <p className="text-xl text-gray-700 mb-2">
        SpryFi Home is available at
      </p>
      <p className="text-lg font-semibold text-blue-600 mb-6">
        {state.address?.formattedAddress}
      </p>
      <p className="text-lg text-gray-600 mb-8">
        Say goodbye to complicated installs. Say hello to simple internet that just works.
      </p>
      
      <Button
        onClick={handleContinue}
        className="px-8 py-4 text-lg font-semibold rounded-lg"
        style={{
          background: 'linear-gradient(90deg, #D72638 0%, #8B0000 100%)',
          color: 'white',
          border: 'none'
        }}
      >
        Customize Your Setup
      </Button>

      <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          No Contracts
        </div>
        <div className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          14-Day Guarantee
        </div>
        <div className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Easy Setup
        </div>
      </div>
    </div>
  );
};
