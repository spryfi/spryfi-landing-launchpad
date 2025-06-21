
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
        }, 1500); // 1.5 second transition
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
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1500 opacity-50" 
          style={{ transition: 'opacity 1.5s ease-in-out, filter 1.5s ease-in-out' }}
        />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-6">
          <h1 
            className={`text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg transition-opacity duration-500 leading-tight max-w-4xl ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentHook}
          </h1>

          <p className="text-base text-white mt-2 drop-shadow-lg leading-relaxed">
            Takes just 30 seconds.
          </p>

          <Button
            onClick={openModal}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-8 py-4 rounded-full text-base shadow-lg transition-all duration-200 mt-4 min-w-[220px]"
          >
            Check Availability
          </Button>
        </div>
      </section>

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
