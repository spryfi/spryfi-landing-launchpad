
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-6 overflow-hidden">
      {/* Animated WiFi Ripple Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" style={{width: '400px', height: '400px', animationDuration: '3s'}}></div>
          <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping" style={{width: '500px', height: '500px', animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute inset-0 rounded-full border border-white/5 animate-ping" style={{width: '600px', height: '600px', animationDuration: '5s', animationDelay: '2s'}}></div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="mb-12 relative">
          {/* SpryFi Router Image */}
          <div className="relative inline-block">
            <img 
              src="/lovable-uploads/66a94db7-943d-4da3-bfd2-3fd4f6f673a9.png" 
              alt="SpryFi Router" 
              className="w-full max-w-md md:max-w-lg mx-auto h-auto object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(255, 255, 255, 0.1))'
              }}
            />
            {/* Green LED Indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            {/* Soft glowing shadow effect */}
            <div className="absolute inset-0 bg-white/5 rounded-lg blur-xl transform scale-110 -z-10"></div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
          The Internet You Actually Need.
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          No contracts. No credit checks. Just fast, reliable internet — anywhere you live or travel.
        </p>
        
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 animate-bounce-in"
        >
          Check Availability Now
        </Button>
        
        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-6 h-6 text-gray-400 mx-auto opacity-70" />
        </div>
      </div>
    </section>
  );
};
