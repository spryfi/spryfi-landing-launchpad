
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          {/* Router visual placeholder - will be replaced with actual image */}
          <div className="w-80 h-60 mx-auto mb-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-2xl flex items-center justify-center relative">
            <div className="w-40 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-blue-600 font-bold text-lg">SpryFi</div>
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Internet That <br />
          <span className="text-blue-600">Just Works.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          No contracts. No credit checks. No gimmicks. <br />
          Just fast, reliable internet for real people.
        </p>
        
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Check Availability Now
        </Button>
        
        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-6 h-6 text-gray-400 mx-auto" />
        </div>
      </div>
    </section>
  );
};
