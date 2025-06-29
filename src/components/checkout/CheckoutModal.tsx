
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
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getInitialState = (): CheckoutState => ({
  step: 'address',
  anchorAddressId: null,
  leadId: null,
  address: null,
  contact: null,
  planSelected: null,
  routerAdded: false,
  totalAmount: 0,
  qualified: false,
  qualificationResult: null,
  flow_completed: false
});

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const [state, setState] = useState<CheckoutState>(getInitialState());

  // Reset state and clear storage when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 CheckoutModal opened - resetting flow state');
      
      // Clear any stored session data
      sessionStorage.removeItem('lead_id');
      sessionStorage.removeItem('qualified');
      sessionStorage.removeItem('address_selected');
      sessionStorage.removeItem('flow_started');
      sessionStorage.removeItem('anchor_address_id');
      sessionStorage.removeItem('qualification_result');
      
      // Clear address form storage
      localStorage.removeItem('addressFormData');
      
      // Reset to initial state
      setState(getInitialState());
      
      console.log('✅ Flow state reset complete - starting from address step');
    }
  }, [isOpen]);

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
          setState(getInitialState());
        }
      }
    };

    checkFlowExpiration();
  }, [isOpen]);

  // EMERGENCY FIX: Force WiFi setup when plan is detected
  useEffect(() => {
    if (state.planSelected) {
      console.log('🚨 PLAN DETECTED - FORCING WIFI STEP:', state.planSelected);
      setTimeout(() => {
        console.log('🚨 TIMEOUT FORCE RENDER');
      }, 100);
    }
  }, [state.planSelected]);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 Checkout state changed:', {
      step: state.step,
      planSelected: state.planSelected,
      qualified: state.qualified
    });
  }, [state.step, state.planSelected, state.qualified]);

  const updateState = (updates: Partial<CheckoutState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Handle plan selection - NUCLEAR OPTION
  const handlePlanSelection = (planType: string) => {
    console.log('🚨 PLAN SELECTION HANDLER TRIGGERED:', planType);
    
    // Update state with plan selection
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

  // NUCLEAR OPTION: Complete render override
  const renderContent = () => {
    // FORCE WiFi setup if any plan is selected - NO EXCEPTIONS
    if (state.planSelected) {
      console.log('🚨 FORCING WiFi SETUP - Plan detected:', state.planSelected);
      return <WiFiSetupStep state={state} updateState={updateState} />;
    }

    // Show plan selection if qualified
    if (state.qualified && !state.planSelected && state.step !== 'address' && state.step !== 'contact') {
      console.log('🚨 Showing plan selection - qualified but no plan');
      return <PlanSelection state={state} updateState={updateState} onPlanSelected={handlePlanSelection} />;
    }

    // Regular flow for other steps
    switch (state.step) {
      case 'address':
        return <AddressStep state={state} updateState={updateState} />;
      case 'contact':
        return <ContactStep state={state} updateState={updateState} />;
      case 'qualification-success':
        return <QualificationSuccess state={state} updateState={updateState} />;
      case 'router-offer':
        return <RouterOffer state={state} updateState={updateState} />;
      case 'checkout':
        return <CheckoutStep state={state} updateState={updateState} onClose={onClose} />;
      case 'not-qualified':
        return (
          <div className="text-center p-8">
            {/* Enhanced SpryFi Branding */}
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
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Check Internet Availability</DialogTitle>
        <DialogDescription className="sr-only">
          Enter your address and contact information to check if SpryFi internet service is available in your area
        </DialogDescription>
        <div className="bg-white">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
