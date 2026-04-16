import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">SpryFi</h3>
            <p className="text-gray-300 leading-relaxed">
              Internet that just works. No contracts, no gimmicks, 
              just reliable connectivity for real people.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Company</h4>
            <div className="space-y-3">
              <Link to="/why-spryfi" className="block text-gray-300 hover:text-white transition-colors">
                Why SpryFi
              </Link>
              <Link to="/faq" className="block text-gray-300 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link to="/support" className="block text-gray-300 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <div className="space-y-3">
              <Link to="/technical-details" className="block text-gray-300 hover:text-white transition-colors">
                Technical Details
              </Link>
              <Link to="/loyalty-savings" className="block text-gray-300 hover:text-white transition-colors">
                Loyalty Savings
              </Link>
              <Link to="/loyalty-terms" className="block text-gray-300 hover:text-white transition-colors">
                Loyalty Terms
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-3 text-blue-400" />
                <span className="text-gray-300">Live Chat Available</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <a href="tel:+15127297797" className="text-gray-300 hover:text-white transition-colors">
                  1-512-729-7797
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                <a href="mailto:support@sprywireless.com" className="text-gray-300 hover:text-white transition-colors">
                  support@sprywireless.com
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 SpryFi. All rights reserved. No contracts. No nonsense.
          </p>
        </div>
      </div>
    </footer>
  );
};
