import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCheckAvailability = () => {
    setMobileOpen(false);
    // Scroll to hero and trigger the address modal
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Dispatch a custom event the Hero can listen for
    window.dispatchEvent(new CustomEvent('open-address-modal'));
  };

  const navLinks = [
    { label: 'Plans & Pricing', to: '/#plans' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Why SpryFi', to: '/why-spryfi' },
    { label: 'Support', to: '/support' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
          SpryFi
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleCheckAvailability}
            className="bg-[#0047AB] hover:bg-[#0060D4] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
          >
            Check Availability
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-700 hover:text-gray-900 font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleCheckAvailability}
              className="w-full bg-[#0047AB] hover:bg-[#0060D4] text-white font-semibold py-3 rounded-full mt-2"
            >
              Check Availability
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
