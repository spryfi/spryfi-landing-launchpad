
import React from 'react';
import { Play } from 'lucide-react';

export const FounderVideo = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16">
          From a Founder Who's Seen It All
        </h2>
        
        <div className="relative mb-12">
          <div className="aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <Play className="w-8 h-8 text-blue-600 ml-1 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
        
        <blockquote className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
          "I've run a successful internet company for 15 years. And I've seen what goes wrong. 
          SpryFi is different—it's built for people, not cable companies."
        </blockquote>
        
        <div className="text-lg text-gray-600">
          — <strong>Paul McKnight</strong>, Founder
        </div>
      </div>
    </section>
  );
};
