import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle } from 'lucide-react';

export const RouterSetup = () => {
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const navigate = useNavigate();

  const generateSSID = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setWifiName(`SpryFi-${randomNum}`);
  };

  const generatePassword = () => {
    const words = ['boat', 'blue', 'fire', 'gold', 'moon', 'star', 'tree', 'what', 'clam', 'wave'];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    setWifiPassword(`${word1}${word2}`);
  };

  const handleFinish = async () => {
    try {
      await supabase.from('provisioning_sessions').insert({
        ssid: wifiName,
        passkey: wifiPassword
      });
      navigate('/checkout');
    } catch (error) {
      console.error('Error saving router setup:', error);
    }
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
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-lg font-medium text-gray-700">
                  WiFi Network Name
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium mb-1">WiFi Network Name (SSID)</p>
                        <p className="text-sm mb-2">This is the name your devices will see when they scan for Wi-Fi networks.</p>
                        <p className="text-sm mb-2">It can include letters, numbers, and hyphens.</p>
                        <p className="text-sm">Choose something easy to recognize, for example SpryFi-Home.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <input
                type="text"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                placeholder="Enter your WiFi network name"
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={generateSSID}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Generate this for me
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-lg font-medium text-gray-700">
                  WiFi Passkey
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium mb-1">WiFi Passkey</p>
                        <p className="text-sm mb-2">This is the key your devices will use to connect securely.</p>
                        <p className="text-sm mb-2">It must be at least 8 characters long and can include letters, numbers, or both.</p>
                        <p className="text-sm">This passkey will be printed on your router sticker for easy reference.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="Enter your WiFi passkey"
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Generate this for me
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 italic">
                <strong>Note:</strong> We'll print these credentials on a sticker on the bottom of your WiFi 7 Router with AI Optimization!
              </p>
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
            
            <Button 
              onClick={handleFinish}
              disabled={!(wifiName && wifiPassword.length >= 8)}
              className={`flex-1 py-3 text-lg font-semibold transition-all duration-200 ${
                !(wifiName && wifiPassword.length >= 8) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-[#0047AB] hover:bg-[#0060D4] text-white'
              }`}
            >
              Finish Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};