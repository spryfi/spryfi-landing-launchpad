
import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">SpryFi</h3>
            <p className="text-gray-300 leading-relaxed">
              Internet that just works. No contracts, no gimmicks, 
              just reliable connectivity for real people.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-3 text-blue-400" />
                <span className="text-gray-300">Live Chat Available</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                <a href="mailto:support@spryfi.net" className="text-gray-300 hover:text-white transition-colors">
                  support@spryfi.net
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <span className="text-gray-300">1-800-SPRYFI-1</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <div className="space-y-3">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Check Coverage
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Plans & Pricing
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Customer Support
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SpryFi. All rights reserved. No contracts. No nonsense.
          </p>
        </div>
      </div>
    </footer>
  );
};
