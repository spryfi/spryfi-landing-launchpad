import React from 'react';
import { Phone, DollarSign, Lock, Wifi, Router, ChartLine } from 'lucide-react';

export const PainPoints = () => {
  const PainIcon = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative flex justify-center items-center mb-4 ${className}`}>
      {children}
    </div>
  );

  const painPoints = [
    {
      icon: (
        <PainIcon>
          <Phone className="text-red-500" size={48} />
          <span className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded font-bold">
            45:00
          </span>
        </PainIcon>
      ),
      headline: "45 minutes on hold",
      description: "Just to report an outage that they already know about"
    },
    {
      icon: (
        <PainIcon>
          <DollarSign className="text-red-500" size={48} />
          <span className="absolute -top-1 -right-1 text-yellow-500">
            ⚠️
          </span>
        </PainIcon>
      ),
      headline: "Bill jumps to $149 with hidden fees",
      description: "After the \"promotional price\" expires (surprise!)"
    },
    {
      icon: (
        <PainIcon>
          <div className="relative">
            <DollarSign className="text-red-500" size={48} />
            <Lock className="absolute -bottom-1 -right-1 text-gray-600" size={24} />
          </div>
        </PainIcon>
      ),
      headline: "$240 early termination fee",
      description: "Trapped in a contract like it's a prison sentence"
    },
    {
      icon: (
        <PainIcon>
          <div className="relative">
            <Wifi className="text-red-500" size={48} />
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </PainIcon>
      ),
      headline: "Internet crawls at 7pm",
      description: "Right when you want to stream something"
    },
    {
      icon: (
        <PainIcon>
          <div className="relative">
            <Router className="text-red-500" size={48} />
            <span className="absolute -top-2 -right-6 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">
              $15/mo
            </span>
          </div>
        </PainIcon>
      ),
      headline: "\"Equipment fee: $15/month\"",
      description: "For a router that costs $60 to buy"
    },
    {
      icon: (
        <PainIcon>
          <div className="relative">
            <ChartLine className="text-red-500" size={48} />
            <DollarSign className="absolute -top-1 -right-1 text-green-600" size={24} />
          </div>
        </PainIcon>
      ),
      headline: "Price increases every year",
      description: "\"To serve you better\" (yeah, right)"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Sound Familiar?
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          You're not alone. Here's what drives Americans crazy about their internet provider:
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {painPoints.map((point, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
            >
              {point.icon}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {point.headline}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl text-center max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">
            We Built SpryFi Because We Were Fed Up Too.
          </h3>
          <p className="text-xl text-blue-100 leading-relaxed">
            No contracts. No hidden fees. No throttling. No nonsense.<br />
            Just honest internet from people who get it.
          </p>
        </div>
      </div>
    </section>
  );
};