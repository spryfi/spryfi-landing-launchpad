
import React from 'react';
import { Shield, DollarSign, Calendar } from 'lucide-react';

export const Guarantee = () => {
  const guarantees = [
    {
      icon: Calendar,
      title: "14-Day Money-Back Guarantee",
      description: "Try it risk-free"
    },
    {
      icon: DollarSign,
      title: "No setup fees or surprises",
      description: "What you see is what you pay"
    },
    {
      icon: Shield,
      title: "Cancel anytime",
      description: "No contracts, no commitments"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">
          Try It Risk-Free
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {guarantees.map((guarantee, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <guarantee.icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {guarantee.title}
              </h3>
              <p className="text-gray-600">
                {guarantee.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
