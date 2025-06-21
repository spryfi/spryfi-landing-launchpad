
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';

export const Hero = () => {
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();

  React.useEffect(() => {
    // Family-focused home internet scenes only
    const heroImages = [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", // family on couch with devices
      "https://images.unsplash.com/photo-1556075798-4825dfaaf498", // family using tablet together at home
      "https://images.unsplash.com/photo-1609220136736-443140cffec6", // family with laptop in living room
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0", // couple using laptop in backyard
      "https://images.unsplash.com/photo-1574168612922-c801da5c7f8e", // family gathered around laptop at home
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952", // parents and children with tablet
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
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b" 
          alt="Families enjoying reliable internet at home" 
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
