
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';

export const Hero = () => {
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();

  React.useEffect(() => {
    // Hero image rotation script
    const heroImages = [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7", // woman with laptop
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b", // gray laptop
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", // woman using laptop
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", // matrix style
    ];

    let currentImage = 0;

    const rotateImages = setInterval(() => {
      currentImage = (currentImage + 1) % heroImages.length;
      const heroImg = document.getElementById("hero-image");
      if (heroImg) {
        heroImg.classList.remove("opacity-100");
        heroImg.classList.add("opacity-0");

        setTimeout(() => {
          heroImg.src = heroImages[currentImage];
          heroImg.classList.remove("opacity-0");
          heroImg.classList.add("opacity-100");
        }, 400);
      }
    }, 5000);

    return () => clearInterval(rotateImages);
  }, []);

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Rotating hero images */}
        <div id="hero-rotator" className="absolute inset-0 w-full h-full z-0">
          <img 
            id="hero-image" 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
            alt="Hero" 
            className="object-cover w-full h-full transition-opacity duration-1000 opacity-100" 
          />
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* Hook overlay text */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6">
          <div className="max-w-4xl mx-auto">
            <h1 
              className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {currentHook}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Fast, reliable internet delivered to your door. No contracts, no credit checks, no technician visits required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={openModal}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
              >
                Check Availability
              </Button>
              <p className="text-sm text-gray-300">
                Enter your address • Takes 30 seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="font-semibold text-white mb-1 drop-shadow-md">Plug & Play</h3>
                <p className="text-sm text-gray-300 drop-shadow-sm">Router delivered to your door, online in minutes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-white mb-1 drop-shadow-md">Lightning Fast</h3>
                <p className="text-sm text-gray-300 drop-shadow-sm">Up to 200 Mbps speeds for all your devices</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-semibold text-white mb-1 drop-shadow-md">14-Day Guarantee</h3>
                <p className="text-sm text-gray-300 drop-shadow-sm">Not happy? Full refund, no questions asked</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
