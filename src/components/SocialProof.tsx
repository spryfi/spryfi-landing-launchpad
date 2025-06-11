
import React from 'react';
import { Star } from 'lucide-react';

export const SocialProof = () => {
  const testimonials = [
    {
      quote: "Finally—an internet company that respects my time.",
      author: "Crystal M.",
      location: "Texas"
    },
    {
      quote: "We get strong signal even way out in the hill country.",
      author: "Joe T.",
      location: "RV traveler"
    },
    {
      quote: "Setup was so easy, I thought I was doing something wrong.",
      author: "Sarah K.",
      location: "Montana"
    },
    {
      quote: "No more calling customer service. It just works.",
      author: "Mike D.",
      location: "Rural Colorado"
    }
  ];

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
          Thousands have already made the switch.
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-4 text-lg">
                "{testimonial.quote}"
              </blockquote>
              <div className="text-sm text-gray-500">
                — {testimonial.author}, {testimonial.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
