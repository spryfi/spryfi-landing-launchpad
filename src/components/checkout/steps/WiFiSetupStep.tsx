
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface WiFiSetupStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const WiFiSetupStep: React.FC<WiFiSetupStepProps> = ({ state, updateState }) => {
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPasskey, setWifiPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');

  // Generate random 4-digit number for SSID
  const generateNetworkName = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    setWifiSsid(`SpryFi_${randomNumber}`);
  };

  // Generate secure passkey with 2 random 4-letter words
  const generateSecurePasskey = () => {
    const words = [
      'mint', 'bike', 'book', 'lamp', 'fish', 'snow', 'tree', 'star',
      'moon', 'ring', 'bird', 'leaf', 'rock', 'wind', 'fire', 'wave',
      'sand', 'gold', 'blue', 'soft', 'warm', 'cool', 'fast', 'slow',
      'jump', 'walk', 'run', 'swim', 'play', 'sing', 'hope', 'love',
      'help', 'work', 'home', 'food', 'time', 'life', 'mind', 'hand'
    ];
    
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    setWifiPasskey(`${word1}${word2}`);
    setPasskeyError('');
  };

  // Validate passkey
  const validatePasskey = (passkey: string) => {
    if (passkey.length < 8) {
      setPasskeyError('Password must be at least 8 characters long');
      return false;
    }
    setPasskeyError('');
    return true;
  };

  const handlePasskeyChange = (value: string) => {
    setWifiPasskey(value);
    validatePasskey(value);
  };

  const handleContinue = async () => {
    if (!validatePasskey(wifiPasskey)) return;
    
    setLoading(true);

    try {
      // Save WiFi settings to leads_fresh table
      await supabase
        .from('leads_fresh')
        .update({
          wifi_ssid: wifiSsid,
          wifi_passkey: wifiPasskey
        })
        .eq('id', state.leadId);

      // Move to router offer step
      updateState({ step: 'router-offer' });
    } catch (error) {
      console.error('Error saving WiFi settings:', error);
      alert('Error saving WiFi settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Generate default values
    const defaultSsid = `SpryFi_${Math.floor(1000 + Math.random() * 9000)}`;
    const words = ['mint', 'bike', 'book', 'lamp', 'fish', 'snow', 'tree', 'star'];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const defaultPasskey = `${word1}${word2}`;

    setLoading(true);

    try {
      // Save default WiFi settings
      await supabase
        .from('leads_fresh')
        .update({
          wifi_ssid: defaultSsid,
          wifi_passkey: defaultPasskey
        })
        .eq('id', state.leadId);

      // Move to router offer step
      updateState({ step: 'router-offer' });
    } catch (error) {
      console.error('Error saving default WiFi settings:', error);
      alert('Error saving WiFi settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = wifiSsid.length > 0 && wifiPasskey.length >= 8 && !passkeyError;

  return (
    <div className="p-8">
      {/* Enhanced SpryFi Branding */}
      <div className="text-center mb-8">
        <div className="text-[#0047AB] text-3xl font-bold mb-2">
          SpryFi
        </div>
        <div className="text-gray-600 text-sm font-medium">
          Internet that just works
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📡</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Would you like us to pre-configure your WiFi 7 router?
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
          We can set up your new WiFi 7 router with an optimized network name and passkey, 
          so it's plug-and-play out of the box. Your details will be printed on a sticker 
          placed on the bottom of the router for easy access.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Network Name (SSID) */}
        <div className="space-y-3">
          <Label htmlFor="wifi_ssid" className="text-lg font-medium text-gray-900">
            Network Name (SSID)
          </Label>
          <div className="flex gap-3">
            <Input
              id="wifi_ssid"
              type="text"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              placeholder="Enter network name"
              className="flex-1 px-4 py-3 text-base"
            />
            <Button
              onClick={generateNetworkName}
              variant="outline"
              className="px-4 py-3 whitespace-nowrap"
            >
              Generate Network Name
            </Button>
          </div>
        </div>

        {/* WiFi Passkey */}
        <div className="space-y-3">
          <Label htmlFor="wifi_passkey" className="text-lg font-medium text-gray-900">
            WiFi Passkey
          </Label>
          <div className="flex gap-3">
            <Input
              id="wifi_passkey"
              type="text"
              value={wifiPasskey}
              onChange={(e) => handlePasskeyChange(e.target.value)}
              placeholder="Enter passkey (min 8 characters)"
              className="flex-1 px-4 py-3 text-base"
            />
            <Button
              onClick={generateSecurePasskey}
              variant="outline"
              className="px-4 py-3 whitespace-nowrap"
            >
              Generate Secure Passkey
            </Button>
          </div>
          {passkeyError && (
            <p className="text-red-600 text-sm flex items-center gap-2">
              <span>❌</span> {passkeyError}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-6">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid || loading}
            className={`w-full py-4 text-lg font-semibold rounded-lg ${
              isFormValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Configuring...' : 'Continue with These Settings'}
          </Button>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
          >
            Skip this step
          </button>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <p className="text-blue-800 text-sm text-center">
            🖨️ We'll print your WiFi name and password on a sticker placed on the bottom of your router, 
            so you'll always have access. If you skip this step, we'll automatically generate these for you.
          </p>
        </div>
      </div>
    </div>
  );
};
