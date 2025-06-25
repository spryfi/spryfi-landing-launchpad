
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
    <section 
      className="py-16 md:py-24 px-4"
      style={{
        background: 'linear-gradient(to bottom, #f7faff 0%, #e6f0ff 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto text-center relative">
        {/* Decorative background element */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 5c13.8 0 25 11.2 25 25S43.8 55 30 55 5 43.8 5 30 16.2 5 30 5zm0 5c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm-5 15h10v10H25V25z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 relative z-10">
          Thousands have already made the switch.
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-card bg-white rounded-2xl p-6 transition-all duration-300 ease-out hover:-translate-y-1"
              style={{
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 text-yellow-400 fill-current"
                    style={{
                      filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.4))'
                    }}
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-4 text-lg leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="text-sm text-gray-500 font-medium">
                — {testimonial.author}, {testimonial.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
