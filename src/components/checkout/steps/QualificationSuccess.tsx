
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
    if (source === 'verizon') return 'sapi1';
    if (source === 'bot') return 'sapi2';
    return '';
  };

  return (
    <div className="flex min-h-[500px] bg-white" data-testid="qualification-success">
      {/* Left Content Section */}
      <div className="flex-1 p-12 flex flex-col justify-center max-w-[60%]">
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

      {/* Right Visual Section */}
      <div className="w-[40%] bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          {/* Placeholder for hero image */}
          <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
            <div className="text-6xl opacity-30">📶</div>
          </div>
          <p className="text-sm text-gray-500 italic">
            High-quality lifestyle image<br />
            (Family using internet at home)
          </p>
        </div>
      </div>
    </div>
  );
};
