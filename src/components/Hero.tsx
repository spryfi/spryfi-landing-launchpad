
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';

export const Hero = () => {
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();

  React.useEffect(() => {
    // Core home internet usage: work, streaming, gaming
    const heroImages = [
      "/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png", // gaming at home
      "/lovable-uploads/8c1667e5-2814-4a78-abe6-4469911e4e24.png", // dad working from home with child
      "/lovable-uploads/c9f4e146-8c48-4411-8b5f-0c9ceb66fc4e.png", // family streaming together
      "/lovable-uploads/3ce628a3-58d7-4f62-972d-82411046939a.png", // child using tablet with headphones
      "/lovable-uploads/cd5c8c35-7747-4f47-9491-e9f1d0bc53df.png", // mobile gaming
      "/lovable-uploads/4d57e83f-db1b-430a-8b7e-3be3e4f0f7b8.png", // family with devices on couch
      "/lovable-uploads/e5884a69-1d16-4c82-9387-c9bf9c831e61.png", // family working/studying at kitchen table
    ];

    let currentImage = 0;
    const rotateImages = setInterval(() => {
      currentImage = (currentImage + 1) % heroImages.length;
      const heroImg = document.getElementById("hero-image") as HTMLImageElement;
      if (heroImg) {
        // Start blur and fade out
        heroImg.style.filter = "blur(4px)";
        heroImg.classList.add("opacity-0");

        setTimeout(() => {
          heroImg.src = heroImages[currentImage];
          heroImg.classList.remove("opacity-0");
          heroImg.style.filter = "blur(0px)";
        }, 1000); // 1 second transition
      }
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(rotateImages);
  }, []);

  return (
    <>
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image with blur and fade transitions */}
        <img 
          id="hero-image" 
          src="/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png" 
          alt="People enjoying reliable internet at home" 
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 opacity-60" 
          style={{ transition: 'opacity 1s ease-in-out, filter 1s ease-in-out' }}
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

          <p className="text-lg text-gray-200 mb-6 drop-shadow-lg">
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
