
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export const PlansSection = () => {
  const plans = [
    {
      name: "Essentials",
      speed: "Up to 100 Mbps",
      bestFor: "Browsing, HD Streaming",
      price: "$99.95/mo",
      popular: false
    },
    {
      name: "Ultra",
      speed: "Up to 200 Mbps",
      bestFor: "Work, 4K Streaming, Gaming",
      price: "$129.95/mo",
      popular: true
    },
    {
      name: "Max",
      speed: "Up to 500 Mbps",
      bestFor: "Multi-device, 8K, Business",
      price: "$149.95/mo",
      popular: false
    }
  ];

  const included = [
    "Unlimited data",
    "No contracts",
    "Modem included",
    "14-day money-back guarantee"
  ];

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          Pick the Plan That's Right for You.
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                plan.popular 
                  ? 'bg-blue-600 text-white transform scale-105' 
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              
              <div className="text-center">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-bold mb-4 ${plan.popular ? 'text-white' : 'text-blue-600'}`}>
                  {plan.price}
                </div>
                <div className={`text-lg mb-2 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.speed}
                </div>
                <div className={`text-sm mb-8 ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.bestFor}
                </div>
                
                <Button 
                  className={`w-full py-3 text-lg font-semibold rounded-full transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-white text-blue-600 hover:bg-gray-100' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Choose {plan.name}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            All Plans Include:
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {included.map((item, index) => (
              <div key={index} className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
