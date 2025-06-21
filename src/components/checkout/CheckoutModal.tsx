import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddressStep } from './steps/AddressStep';
import { ContactStep } from './steps/ContactStep';
import { QualificationSuccess } from './steps/QualificationSuccess';
import { PlanSelection } from './steps/PlanSelection';
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
  } | null;
  planSelected: string | null;
  routerAdded: boolean;
  totalAmount: number;
  qualified: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const [state, setState] = useState<CheckoutState>({
    step: 'address',
    anchorAddressId: null,
    leadId: null,
    address: null,
    contact: null,
    planSelected: null,
    routerAdded: false,
    totalAmount: 0,
    qualified: false
  });

  const updateState = (updates: Partial<CheckoutState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (state.step) {
      case 'address':
        return <AddressStep state={state} updateState={updateState} />;
      case 'contact':
        return <ContactStep state={state} updateState={updateState} />;
      case 'qualification-success':
        return <QualificationSuccess state={state} updateState={updateState} />;
      case 'plan-selection':
        return <PlanSelection state={state} updateState={updateState} />;
      case 'router-offer':
        return <RouterOffer state={state} updateState={updateState} />;
      case 'checkout':
        return <CheckoutStep state={state} updateState={updateState} onClose={onClose} />;
      case 'not-qualified':
        return (
          <div className="text-center p-8">
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
          Enter your address to check if SpryFi internet service is available in your area
        </DialogDescription>
        <div className="bg-white">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
