
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const backgroundScenes = [
  {
    url: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=1920&q=80",
    alt: "Family streaming in a country home"
  },
  {
    url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1920&q=80", 
    alt: "Remote work setup"
  },
  {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80",
    alt: "Online gaming setup"
  },
  {
    url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1920&q=80",
    alt: "Video call from mobile setup"
  },
  {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80",
    alt: "Nighttime work with glowing laptop"
  }
];

export const Hero = () => {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % backgroundScenes.length);
    }, 6000); // Change scene every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Rotating background scenes */}
      <div className="absolute inset-0">
        {backgroundScenes.map((scene, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ${
              index === currentScene ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${scene.url})`,
              filter: 'blur(1px) brightness(0.7)',
            }}
          >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ))}
      </div>
      
      {/* Deep gradient overlay for cinematic effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70"></div>
      
      {/* Spotlight effect from above */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[600px] bg-gradient-radial from-white/20 via-white/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      {/* WiFi ripple rings animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border border-blue-400/10 animate-ping" style={{width: '300px', height: '300px', animationDuration: '3s'}}></div>
          <div className="absolute inset-0 rounded-full border border-blue-400/15 animate-ping" style={{width: '400px', height: '400px', animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute inset-0 rounded-full border border-blue-400/10 animate-ping" style={{width: '500px', height: '500px', animationDuration: '5s', animationDelay: '2s'}}></div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10 px-6">
        <div className="mb-16 relative">
          {/* SpryFi Router with cinematic lighting */}
          <div className="relative inline-block">
            {/* Stage ground shadow */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-96 h-24 bg-gradient-radial from-blue-300/20 via-white/10 to-transparent rounded-full blur-2xl"></div>
            
            {/* Router image with premium lighting effects */}
            <div className="relative">
              <img 
                src="/lovable-uploads/66a94db7-943d-4da3-bfd2-3fd4f6f673a9.png" 
                alt="SpryFi Router" 
                className="w-full max-w-md md:max-w-lg mx-auto h-auto object-contain"
                style={{
                  filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.1))',
                }}
              />
              
              {/* Edge highlights for premium product feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-lg"></div>
              
              {/* Green LED indicator with pulse */}
              <div className="absolute top-4 right-8 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50">
                <div className="absolute inset-0 bg-green-300 rounded-full animate-ping"></div>
              </div>
              
              {/* Additional stage lighting reflection */}
              <div className="absolute -inset-4 bg-gradient-radial from-white/5 via-transparent to-transparent blur-xl"></div>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
          The Internet You Actually Need.
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          No contracts. No credit checks. Just fast, reliable internet — made for real life.
        </p>
        
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 animate-bounce-in group relative overflow-hidden"
        >
          <span className="relative z-10">Check Availability Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 border-2 border-blue-400/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
        </Button>
        
        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-6 h-6 text-gray-400 mx-auto opacity-70" />
        </div>
      </div>
    </section>
  );
};
