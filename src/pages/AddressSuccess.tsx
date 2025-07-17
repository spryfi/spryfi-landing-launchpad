import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AddressSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* SpryFi Branding */}
          <div className="text-center mb-6">
            <div className="text-[#0047AB] text-3xl font-bold mb-2">
              SpryFi
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Internet that just works
            </div>
          </div>

          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg relative">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.65-4.35-1.65-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.86 9.14 5 13z"/>
              </svg>
              
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Congrats — your address is covered!
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Great news! SpryFi internet service is available at your location. 
            You can now choose from our available plans and get connected.
          </p>

          {/* Continue Button */}
          <Link to="/plans">
            <Button className="bg-[#0047AB] hover:bg-[#0060D4] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 w-full max-w-md">
              Choose Your Plan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};