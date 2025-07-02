
import React from 'react';
import { Check, Unlock, Package, Users } from 'lucide-react';

export const WhySpryFi = () => {
  const features = [
    {
      icon: Check,
      title: "Truly Unlimited",
      description: "No throttling at 7pm. No data caps. Ever."
    },
    {
      icon: Unlock,
      title: "No Contracts",
      description: "Month-to-month freedom. Cancel anytime. Zero penalties."
    },
    {
      icon: Package,
      title: "Plug & Play Setup",
      description: "No waiting for installers. Online in 5 minutes."
    },
    {
      icon: Users,
      title: "Real Human Support",
      description: "Average response: 47 seconds. No robots. No transfers."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          Here's How SpryFi Solves These Problems
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <feature.icon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
