
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
      const heroImg = document.getElementById("hero-image") as HTMLImageElement;
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
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image */}
        <img 
          id="hero-image" 
          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000" 
        />
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-6">
          <h1 
            className={`text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg transition-opacity duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentHook}
          </h1>

          <p className="text-lg text-gray-200 mb-6 drop-shadow-sm">
            Enter your address • Takes 30 seconds
          </p>

          <Button
            onClick={openModal}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg transition-all duration-200"
          >
            Check Availability
          </Button>

          {/* Clean simple benefits */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center text-center text-white space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
            <span className="flex items-center">📦 Free shipping</span>
            <span className="flex items-center">⚡ Fast setup</span>
            <span className="flex items-center">✅ No contracts</span>
          </div>
        </div>
      </section>

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
