
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { CheckoutModal } from './checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';

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
  const { isOpen, openModal, closeModal } = useCheckoutModal();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % backgroundScenes.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Load Google Places API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD6qNfHpq_KXUOHN_PjsUGqEygKIJ4R4t4&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Set up global callback function
      window.initAutocomplete = window.initAutocomplete || (() => {
        console.log('Google Places API loaded');
      });
    }
  }, []);

  return (
    <>
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
        
        <div className="max-w-6xl mx-auto text-center relative z-10 px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
            The Internet You Actually Need.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            No contracts. No credit checks. Just fast, reliable internet — made for real life.
          </p>
          
          <Button 
            onClick={openModal}
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

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
