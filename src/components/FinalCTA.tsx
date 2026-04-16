import React from 'react';

export const FinalCTA = () => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('open-address-modal'));
  };

  return (
    <section className="py-20 bg-[#0047AB] px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready for Internet That Just Works?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          No contracts, no hidden fees, no hassle. Check if SpryFi is available at your address — it only takes 10 seconds.
        </p>
        <button
          onClick={handleClick}
          className="bg-white hover:bg-gray-50 text-[#0047AB] font-bold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
        >
          Check Availability
        </button>
      </div>
    </section>
  );
};
