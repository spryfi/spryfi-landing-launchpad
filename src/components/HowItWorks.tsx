
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SimpleAddressInput from '@/components/SimpleAddressInput';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';

export const HowItWorks = () => {
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  const steps = [
    {
      number: "1",
      title: "Check Your Address",
      description: "We'll confirm coverage in seconds."
    },
    {
      number: "2",
      title: "Pick Your Plan", 
      description: "Choose the speed that fits your needs."
    },
    {
      number: "3",
      title: "Plug It In",
      description: "Get your SpryFi kit in the mail. You're online in minutes."
    }
  ];

  const handleGetStarted = () => {
    setShowAddressInput(true);
  };

  const handleAddressSelect = (address: string) => {
    console.log('Address selected:', address);
    setSelectedAddress(address);
    setShowCheckoutModal(true);
  };

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          Setup Is Easy as 1-2-3
        </h2>
        
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 transform translate-x-6"></div>
              )}
            </div>
          ))}
        </div>
        
        {!showAddressInput ? (
          <div className="text-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-center text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">
                Great! Let's see if our award winning service is available at your location.
              </h3>
              <p className="text-blue-100 text-lg mb-6">
                We're happy you're here! Enter your address to check coverage.
              </p>
              
              <div className="relative z-40" style={{ overflow: 'visible' }}>
                <SimpleAddressInput
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter your street address"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckoutModal 
        isOpen={showCheckoutModal} 
        onClose={() => setShowCheckoutModal(false)}
      />
    </section>
  );
};
