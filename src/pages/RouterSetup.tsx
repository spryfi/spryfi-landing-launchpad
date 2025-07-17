import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RouterSetup = () => {
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  const handleFinish = () => {
    // Handle completion logic
    console.log('Setup complete:', { wifiName, wifiPassword });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* SpryFi Branding */}
          <div className="text-center mb-8">
            <div className="text-[#0047AB] text-3xl font-bold mb-2">
              SpryFi
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Internet that just works
            </div>
          </div>

          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Set Up Your Router
            </h1>
            <p className="text-gray-600 text-lg">
              Configure your WiFi network settings to complete the setup.
            </p>
          </div>

          {/* Router Setup Form */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WiFi Network Name
              </label>
              <input
                type="text"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                placeholder="Enter your WiFi network name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WiFi Password
              </label>
              <input
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="Enter your WiFi password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Setup Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your router will be shipped with pre-configured settings. You can customize your WiFi name and password here.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link to="/plans" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full py-3 text-lg font-semibold"
              >
                Back to Plans
              </Button>
            </Link>
            
            <Link to="/" className="flex-1">
              <Button 
                onClick={handleFinish}
                className="bg-[#0047AB] hover:bg-[#0060D4] text-white w-full py-3 text-lg font-semibold transition-all duration-200"
              >
                Finish Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};