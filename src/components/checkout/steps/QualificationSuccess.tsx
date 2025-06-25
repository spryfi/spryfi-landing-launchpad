
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutState } from '../CheckoutModal';

interface QualificationSuccessProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const QualificationSuccess: React.FC<QualificationSuccessProps> = ({ state, updateState }) => {
  const handleContinue = () => {
    updateState({ step: 'plan-selection' });
  };

  // Determine internal qualification code
  const getQualificationCode = () => {
    const source = state.qualificationResult?.source;
    if (source === 'verizon') return 'sapi1';
    if (source === 'bot') return 'sapi2';
    return '';
  };

  return (
    <div className="p-8 text-center relative">
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

      {/* Internal qualification code */}
      <div id="qualification-code" className="text-xs text-gray-400 text-center mt-4">
        {getQualificationCode()}
      </div>
    </div>
  );
};
