
import React from 'react';
import { Button } from '@/components/ui/button';

export const HowItWorks = () => {
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
        
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
};
