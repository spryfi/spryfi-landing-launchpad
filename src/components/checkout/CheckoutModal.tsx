import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddressStep } from './steps/AddressStep';
import { ContactStep } from './steps/ContactStep';
import { QualificationSuccess } from './steps/QualificationSuccess';
import { PlanSelection } from './steps/PlanSelection';
import { WiFiSetupStep } from './steps/WiFiSetupStep';
import { RouterOffer } from './steps/RouterOffer';
import { CheckoutStep } from './steps/CheckoutStep';

export interface CheckoutState {
  step: string;
  anchorAddressId: string | null;
  leadId: string | null;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    formattedAddress?: string;
  } | null;
  contact: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  } | null;
  planSelected: string | null;
  routerAdded: boolean;
  totalAmount: number;
  qualified: boolean;
  qualificationResult?: {
    source: string;
    network_type?: string;
    max_speed_mbps?: number;
  } | null;
  flow_completed?: boolean;
  preselectedPlan?: string | null;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlan?: string;
}

const getInitialState = (preselectedPlan?: string): CheckoutState => ({
  step: 'address',
  anchorAddressId: null,
  leadId: null,
  address: null,
  contact: null,
  planSelected: preselectedPlan || null,
  routerAdded: false,
  totalAmount: 0,
  qualified: false,
  qualificationResult: null,
  flow_completed: false,
  preselectedPlan: preselectedPlan || null
});

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, preselectedPlan }) => {
  const [state, setState] = useState<CheckoutState>(getInitialState(preselectedPlan));

  // COMPREHENSIVE STATE DEBUGGING
  useEffect(() => {
    console.log('🔍 FULL STATE DEBUG:');
    console.log('- step:', state.step);
    console.log('- planSelected:', state.planSelected);
    console.log('- preselectedPlan:', state.preselectedPlan);
    console.log('- qualified:', state.qualified);
    console.log('- isOpen:', isOpen);
    console.log('- props.preselectedPlan:', preselectedPlan);
    console.log('- All state:', state);
    console.log('==================');
  }, [state, isOpen, preselectedPlan]);

  // DOM DEBUGGING - Check for multiple modals
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        console.log('🔍 CHECKING FOR MULTIPLE MODALS');
        const qualificationElements = document.querySelectorAll('[data-testid*="qualification"], [class*="qualification"]');
        console.log('Found qualification elements:', qualificationElements.length);
        
        const planElements = document.querySelectorAll('[data-testid*="plan"], [class*="plan"]');
        console.log('Found plan elements:', planElements.length);
        
        const wifiElements = document.querySelectorAll('[data-testid*="wifi"], [class*="wifi"]');
        console.log('Found wifi elements:', wifiElements.length);
      }, 100);
    }
  }, [isOpen, state.step]);

  // Reset state when modal opens with preselected plan
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 CheckoutModal opened - resetting flow state');
      
      // Clear session data
      sessionStorage.removeItem('lead_id');
      sessionStorage.removeItem('qualified');
      sessionStorage.removeItem('address_selected');
      sessionStorage.removeItem('flow_started');
      sessionStorage.removeItem('anchor_address_id');
      sessionStorage.removeItem('qualification_result');
      
      // Clear address form storage
      localStorage.removeItem('addressFormData');
      
      // Reset to initial state with preselected plan
      const initialState = getInitialState(preselectedPlan);
      setState(initialState);
      
      console.log('✅ Flow state reset complete - starting from address step with preselected plan:', preselectedPlan);
      console.log('✅ Initial state set:', initialState);
    }
  }, [isOpen, preselectedPlan]);

  // Set flow start timestamp when moving past address step
  useEffect(() => {
    if (state.step !== 'address' && state.step !== 'not-qualified') {
      const flowStarted = sessionStorage.getItem('flow_started');
      if (!flowStarted) {
        sessionStorage.setItem('flow_started', Date.now().toString());
        console.log('⏱️ Flow start timestamp set');
      }
    }
  }, [state.step]);

  // Check for flow expiration on component mount
  useEffect(() => {
    const checkFlowExpiration = () => {
      const startedAt = parseInt(sessionStorage.getItem('flow_started') || '0', 10);
      const expired = startedAt > 0 && Date.now() - startedAt > 5 * 60 * 1000; // 5 minutes
      
      if (expired) {
        console.log('⏰ Flow expired - clearing session data');
        sessionStorage.clear();
        localStorage.removeItem('addressFormData');
        
        if (isOpen) {
          setState(getInitialState(preselectedPlan));
        }
      }
    };

    checkFlowExpiration();
  }, [isOpen, preselectedPlan]);

  const updateState = (updates: Partial<CheckoutState>) => {
    console.log('🔄 STATE UPDATE REQUESTED:', updates);
    console.log('🔄 CURRENT STATE BEFORE UPDATE:', state);
    
    setState(prev => {
      const newState = { ...prev, ...updates };
      console.log('🔄 NEW STATE AFTER UPDATE:', newState);
      return newState;
    });
  };

  // Handle plan selection
  const handlePlanSelection = (planType: string) => {
    console.log('🚨 PLAN SELECTION HANDLER TRIGGERED:', planType);
    console.log('🚨 CURRENT STATE BEFORE PLAN SELECTION:', state);
    
    setState(prev => {
      const newState = {
        ...prev,
        planSelected: planType,
        step: 'wifi-setup'
      };
      console.log('🚨 PLAN HANDLER COMPLETE - New State:', newState);
      return newState;
    });
  };

  // NUCLEAR OPTION - Force component replacement
  const renderCurrentStep = () => {
    console.log('🎯 RENDER DECISION:', { 
      step: state.step, 
      planSelected: state.planSelected, 
      preselectedPlan: state.preselectedPlan,
      qualified: state.qualified 
    });
    
    // CRITICAL FIX: If we have a preselected plan and we're qualified, ALWAYS show WiFi setup
    if ((state.planSelected || state.preselectedPlan) && state.qualified) {
      console.log('🚀 FORCING WIFI SETUP - BYPASSING QUALIFICATION SUCCESS');
      return <WiFiSetupStep state={state} updateState={updateState} />;
    }
    
    // If we have a preselected plan but not qualified yet, show the appropriate step
    if (state.preselectedPlan && !state.qualified) {
      console.log('🎯 PRESELECTED PLAN - SHOWING APPROPRIATE STEP FOR QUALIFICATION');
      
      // Show address step if we haven't qualified yet
      if (state.step === 'address') {
        return <AddressStep state={state} updateState={updateState} />;
      }
      
      // Show contact step if we have address but need contact info
      if (state.step === 'contact') {
        return <ContactStep state={state} updateState={updateState} />;
      }
    }
    
    // Regular step-based flow
    switch (state.step) {
      case 'address':
        console.log('🔍 Rendering AddressStep');
        return <AddressStep state={state} updateState={updateState} />;
      case 'contact':
        console.log('🔍 Rendering ContactStep');
        return <ContactStep state={state} updateState={updateState} />;
      case 'qualification-success':
        console.log('🔍 Rendering QualificationSuccess');
        return <QualificationSuccess state={state} updateState={updateState} />;
      case 'plan-selection':
        console.log('🔍 Rendering PlanSelection');
        return <PlanSelection state={state} updateState={updateState} onPlanSelected={handlePlanSelection} />;
      case 'wifi-setup':
        console.log('🔍 Rendering WiFiSetupStep');
        return <WiFiSetupStep state={state} updateState={updateState} />;
      case 'router-offer':
        console.log('🔍 Rendering RouterOffer');
        return <RouterOffer state={state} updateState={updateState} />;
      case 'checkout':
        console.log('🔍 Rendering CheckoutStep');
        return <CheckoutStep state={state} updateState={updateState} onClose={onClose} />;
      case 'not-qualified':
        console.log('🔍 Rendering not-qualified');
        return (
          <div className="text-center p-8">
            <div className="text-center mb-6">
              <div className="text-[#0047AB] text-3xl font-bold mb-2">
                SpryFi
              </div>
              <div className="text-gray-600 text-sm font-medium">
                Internet that just works
              </div>
            </div>

            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We're not in your area — yet.
            </h2>
            <p className="text-gray-600 mb-6">
              We'll notify you as soon as we launch near you!
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        );
      default:
        console.log('🔍 Default case - step:', state.step);
        return null;
    }
  };

  // LAST RESORT - Direct DOM manipulation (FIXED TYPE ERROR)
  useEffect(() => {
    if ((state.planSelected || state.preselectedPlan) && state.qualified) {
      console.log('🔨 DOM MANIPULATION - HIDING QUALIFICATION CARD');
      const qualificationCard = document.querySelector('[data-testid="qualification-success"]') as HTMLElement;
      if (qualificationCard) {
        qualificationCard.style.display = 'none';
      }
    }
  }, [state.planSelected, state.preselectedPlan, state.qualified]);

  console.log('🔍 ABOUT TO RENDER - Final state check:', {
    planSelected: state.planSelected,
    step: state.step,
    qualified: state.qualified,
    preselectedPlan: state.preselectedPlan
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Check Internet Availability</DialogTitle>
        <DialogDescription className="sr-only">
          Enter your address and contact information to check if SpryFi internet service is available in your area
        </DialogDescription>
        <div className="bg-white">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
