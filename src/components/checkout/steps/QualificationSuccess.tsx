
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutState } from '../CheckoutModal';

interface QualificationSuccessProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const QualificationSuccess: React.FC<QualificationSuccessProps> = ({ state, updateState }) => {
  console.log('🔍 QUALIFICATION SUCCESS COMPONENT STATE:', {
    step: state.step,
    planSelected: state.planSelected,
    preselectedPlan: state.preselectedPlan,
    qualified: state.qualified
  });

  const handleContinue = () => {
    console.log('🎯 QUALIFICATION SUCCESS - CONTINUE CLICKED');
    console.log('🎯 Current state:', { planSelected: state.planSelected, preselectedPlan: state.preselectedPlan });
    
    // If plan is already selected (from landing page), go to WiFi setup
    // If no plan selected (check availability flow), go to plan selection
    if (state.planSelected || state.preselectedPlan) {
      console.log('🚀 PLAN EXISTS - GOING TO WIFI SETUP');
      updateState({ 
        step: 'wifi-setup',
        planSelected: state.planSelected || state.preselectedPlan
      });
    } else {
      console.log('🎯 NO PLAN - GOING TO PLAN SELECTION');
      updateState({ step: 'plan-selection' });
    }
  };

  // Determine internal qualification code based on source
  const getQualificationCode = () => {
    const source = state.qualificationResult?.source;
    if (source === 'verizon') return 'verizon-api';
    return '';
  };

  return (
    <div className="bg-white/90 rounded-xl shadow-xl p-6 max-w-2xl mx-auto backdrop-blur-md border border-neutral-200 animate-fade-in" data-testid="qualification-success">
      {/* Content Section */}
      <div className="flex flex-col justify-center text-center">
        {/* Enhanced SpryFi Branding */}
        <div className="text-center mb-8">
          <div className="text-[#0047AB] text-3xl font-bold mb-2">
            SpryFi
          </div>
          <div className="text-gray-600 text-sm font-medium">
            Internet that just works
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-light text-gray-900 mb-6 leading-tight">
          Welcome to internet<br />
          that actually works
        </h1>

        {/* Address Confirmation */}
        <div className="mb-8">
          <p className="text-lg text-gray-600 mb-2">You're qualified for SpryFi Home at:</p>
          <p className="text-lg font-medium text-[#0047AB]">
            {state.address?.formattedAddress}
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-[#0047AB] flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-gray-800">Real person support (not a call center)</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-[#0047AB] flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-gray-800">Installation in 2-3 days</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-[#0047AB] flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-gray-800">No annual contracts or surprises</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-8">
          <Button
            onClick={handleContinue}
            className="bg-[#0047AB] hover:bg-[#003a94] text-white px-8 py-4 text-lg font-medium rounded-lg border-none shadow-sm transition-all duration-200 hover:shadow-md"
          >
            Let's get you connected
          </Button>
        </div>

        {/* Internal qualification code */}
        <div className="text-xs text-gray-400 font-mono">
          {getQualificationCode()}
        </div>
      </div>
    </div>
  );
};
