
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';

export const Hero = () => {
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className={`text-5xl md:text-7xl font-bold text-gray-900 mb-6 transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {currentHook}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Fast, reliable internet delivered to your door. No contracts, no credit checks, no technician visits required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={openModal}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
              >
                Check Availability
              </Button>
              <p className="text-sm text-gray-500">
                Enter your address • Takes 30 seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-semibold text-gray-900 mb-1">Plug & Play</h3>
                <p className="text-sm text-gray-600">Router delivered to your door, online in minutes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                <p className="text-sm text-gray-600">Up to 200 Mbps speeds for all your devices</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-semibold text-gray-900 mb-1">14-Day Guarantee</h3>
                <p className="text-sm text-gray-600">Not happy? Full refund, no questions asked</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
