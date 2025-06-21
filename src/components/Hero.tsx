
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';

export const Hero = () => {
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();

  React.useEffect(() => {
    // Curated hero images - home and lifestyle focused
    const heroImages = [
      "https://images.unsplash.com/photo-1649972904349-6e44c42644a7", // woman with laptop on bed
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", // woman using laptop at home
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04", // modern living room setup
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", // person working from home office
      "https://images.unsplash.com/photo-1556761175-b413da4baf72", // cozy home workspace
    ];

    let currentImage = 0;

    const rotateImages = setInterval(() => {
      currentImage = (currentImage + 1) % heroImages.length;
      const heroImg = document.getElementById("hero-image") as HTMLImageElement;
      if (heroImg) {
        heroImg.classList.add("opacity-0");

        setTimeout(() => {
          heroImg.src = heroImages[currentImage];
          heroImg.classList.remove("opacity-0");
        }, 750); // Smooth fade out
      }
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(rotateImages);
  }, []);

  return (
    <>
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image with smooth transitions */}
        <img 
          id="hero-image" 
          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
          alt="People enjoying reliable internet at home" 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] opacity-60" 
        />
        
        {/* Dark overlay for better text contrast */}
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

          {/* Clean benefit icons */}
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
