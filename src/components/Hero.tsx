import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckoutModal } from '@/hooks/useCheckoutModal';
import { useRotatingHook } from '@/hooks/useRotatingHook';
import SimpleAddressInput from '@/components/SimpleAddressInput';
import { supabase } from '@/integrations/supabase/client';

export const Hero = () => {
  // Call all hooks at the top level - this is critical
  const { isOpen, openModal, closeModal } = useCheckoutModal();
  const { currentHook, isVisible } = useRotatingHook();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    let intervalId: NodeJS.Timeout;

    // Add a small delay to ensure DOM is ready
    const startRotation = () => {
      intervalId = setInterval(() => {
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
    };

    // Start rotation after a brief delay
    const timeoutId = setTimeout(startRotation, 100);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty dependency array

  const handleAddressSelect = (address: string) => {
    console.log('Address selected from autocomplete:', address);
    setSelectedAddress(address);
    // Automatically transition to contact form
    setShowAddressModal(false);
    setShowContactModal(true);
  };

  const handleContactSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to leads_fresh table
      const { data, error } = await supabase.functions.invoke('save-lead', {
        body: {
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          anchor_address_id: null,
          address_line1: selectedAddress,
          status: 'started',
          lead_type: 'address_check'
        }
      });

      if (error) {
        console.error('Error saving lead:', error);
        throw error;
      }

      console.log('✅ Lead saved successfully:', data);
      
      // Close modal and show success
      setShowContactModal(false);
      alert('Thank you! We\'ll check availability and be in touch soon.');
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setSelectedAddress('');

    } catch (error) {
      console.error('❌ Save lead error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModal3D = (children: React.ReactNode) => (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div 
        className="relative rounded-xl overflow-hidden"
        style={{
          width: '480px',
          height: '320px',
          backgroundColor: '#0047AB',
          transform: 'perspective(1000px) rotateY(-5deg)',
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.6),
            0 12px 24px rgba(0, 0, 0, 0.4),
            0 6px 12px rgba(0, 0, 0, 0.3)
          `,
          filter: 'drop-shadow(0 0 20px rgba(0, 71, 171, 0.3))',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Enhanced 3D depth layer */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: '#003a94',
            transform: 'translateZ(-8px)',
            zIndex: -1
          }}
        />
        
        {children}
      </div>
    </div>
  );

  return (
    <>
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image with blur and fade transitions */}
        <img 
          id="hero-image" 
          src="/lovable-uploads/b2299131-f552-4bda-aa70-25bb52991901.png" 
          alt="People enjoying reliable internet at home" 
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1500 opacity-60" 
          style={{ transition: 'opacity 1.5s ease-in-out, filter 1.5s ease-in-out' }}
        />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-6">
          <h1 
            className={`text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg transition-opacity duration-500 leading-tight max-w-4xl ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {currentHook || "Finally. Internet that doesn't hate you."}
          </h1>

          <p className="text-base text-white mt-2 drop-shadow-lg leading-relaxed">
            Takes just 30 seconds.
          </p>

          <button
            onClick={() => setShowAddressModal(true)}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold px-8 py-4 rounded-full text-base shadow-lg transition-all duration-200 mt-4 min-w-[220px]"
          >
            Check Availability
          </button>
        </div>
      </section>

      {/* Address Modal */}
      {showAddressModal && renderModal3D(
        <>
          {/* Close X with enhanced hover effect */}
          <button
            onClick={() => setShowAddressModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            ×
          </button>

          {/* Content with enhanced depth */}
          <div 
            className="px-6 py-6 h-full flex flex-col justify-center text-center relative"
            style={{
              transform: 'translateZ(4px)'
            }}
          >
            {/* Logo with glow effect */}
            <div 
              className="text-white text-lg font-normal mb-6"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              SpryFi
            </div>

            {/* Headline with enhanced text shadow */}
            <h2 
              className="text-white text-xl font-bold mb-2 leading-tight"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              See if our award-winning internet has arrived<br />
              in your neighborhood
            </h2>

            {/* Subheadline */}
            <p 
              className="text-blue-100 text-base mb-6"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              Simple internet, no runaround
            </p>

            {/* Address Input with enhanced 3D effect */}
            <div 
              className="relative z-40 mb-4" 
              style={{ 
                overflow: 'visible',
                transform: 'translateZ(2px)'
              }}
            >
              <SimpleAddressInput
                onAddressSelect={handleAddressSelect}
                placeholder="Enter your street address"
              />
            </div>

            {/* Footer with subtle shadow */}
            <p 
              className="text-blue-100 text-sm"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
              }}
            >
              Results in 10 seconds
            </p>
          </div>
        </>
      )}

      {/* Contact Modal */}
      {showContactModal && renderModal3D(
        <>
          {/* Close X */}
          <button
            onClick={() => setShowContactModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            ×
          </button>

          {/* Content */}
          <div 
            className="px-6 py-6 h-full flex flex-col justify-center text-center relative"
            style={{
              transform: 'translateZ(4px)'
            }}
          >
            {/* Logo */}
            <div 
              className="text-white text-lg font-normal mb-4"
              style={{
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              SpryFi
            </div>

            {/* Headline */}
            <h2 
              className="text-white text-xl font-bold mb-2 leading-tight"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              Let's get your results
            </h2>

            {/* Subheadline */}
            <p 
              className="text-blue-100 text-sm mb-4"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              We'll check availability and send details to your email
            </p>

            {/* Form Inputs */}
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 text-base placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleContactSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transform: 'translateZ(2px)',
                transformStyle: 'preserve-3d'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Get My Results'}
            </button>
          </div>
        </>
      )}

      <CheckoutModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
};
