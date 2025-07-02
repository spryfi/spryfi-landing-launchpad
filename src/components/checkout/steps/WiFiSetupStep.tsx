
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CheckoutState } from '../CheckoutModal';

interface WiFiSetupStepProps {
  state: CheckoutState;
  updateState: (updates: Partial<CheckoutState>) => void;
}

export const WiFiSetupStep: React.FC<WiFiSetupStepProps> = ({ state, updateState }) => {
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPasskey, setWifiPasskey] = useState('');
  const [skipSetup, setSkipSetup] = useState(false);
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

  // Validate passkey - 8+ alphanumeric characters
  const validatePasskey = (passkey: string) => {
    console.log('🔍 Validating passkey:', { passkey, length: passkey.length });
    
    if (passkey.length < 8) {
      console.log('❌ Passkey too short');
      setPasskeyError('Password must be at least 8 alphanumeric characters');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(passkey)) {
      console.log('❌ Passkey invalid characters');
      setPasskeyError('Password must contain only letters and numbers');
      return false;
    }
    console.log('✅ Passkey valid');
    setPasskeyError('');
    return true;
  };

  const handlePasskeyChange = (value: string) => {
    setWifiPasskey(value);
    if (value.length > 0) {
      validatePasskey(value);
    } else {
      setPasskeyError('');
    }
  };

  const handleSkipSetupChange = (checked: boolean) => {
    setSkipSetup(checked);
    if (checked) {
      // Auto-generate both values when skip is enabled
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      setWifiSsid(`SpryFi_${randomNumber}`);
      
      const words = ['mint', 'bike', 'book', 'lamp', 'fish', 'snow', 'tree', 'star'];
      const word1 = words[Math.floor(Math.random() * words.length)];
      const word2 = words[Math.floor(Math.random() * words.length)];
      setWifiPasskey(`${word1}${word2}`);
      setPasskeyError('');
    }
  };

  const saveWifiSettings = async (ssid: string, passkey: string) => {
    try {
      // Check if provisioning session already exists for this lead
      const { data: existingSession, error: fetchError } = await supabase
        .from('provisioning_sessions')
        .select('id')
        .eq('lead_id', state.leadId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSession) {
        // Update existing session
        const { error: updateError } = await supabase
          .from('provisioning_sessions')
          .update({
            ssid: ssid,
            passkey: passkey,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);

        if (updateError) throw updateError;
      } else {
        // Create new provisioning session
        const { error: insertError } = await supabase
          .from('provisioning_sessions')
          .insert({
            lead_id: state.leadId,
            ssid: ssid,
            passkey: passkey,
            status: 'in_progress',
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      console.log('WiFi settings saved to provisioning_sessions');
    } catch (error) {
      console.error('Error saving WiFi settings:', error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (!skipSetup && !validatePasskey(wifiPasskey)) return;
    
    setLoading(true);

    try {
      const finalSsid = wifiSsid || `SpryFi_${Math.floor(1000 + Math.random() * 9000)}`;
      const finalPasskey = wifiPasskey || (() => {
        const words = ['mint', 'bike', 'book', 'lamp', 'fish', 'snow', 'tree', 'star'];
        const word1 = words[Math.floor(Math.random() * words.length)];
        const word2 = words[Math.floor(Math.random() * words.length)];
        return `${word1}${word2}`;
      })();

      // Only save WiFi settings if we have a leadId
      if (state.leadId) {
        await saveWifiSettings(finalSsid, finalPasskey);
      } else {
        console.log('⚠️ No leadId available, skipping WiFi settings save');
      }
      
      // Always proceed to router offer step regardless of save status
      updateState({ step: 'router-offer' });
    } catch (error) {
      console.error('Error saving WiFi settings:', error);
      // Still proceed even if saving fails
      updateState({ step: 'router-offer' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = skipSetup || (wifiSsid.length > 0 && wifiPasskey.length >= 8 && !passkeyError);
  
  // Debug form validation
  console.log('🔍 Form validation check:', {
    skipSetup,
    wifiSsid: wifiSsid,
    wifiSsidLength: wifiSsid.length,
    wifiPasskey: wifiPasskey,
    wifiPasskeyLength: wifiPasskey.length,
    passkeyError,
    isFormValid
  });

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
        <div className="mb-4 flex justify-center">
          <Wifi className="w-16 h-16 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Let's Set Up Your WiFi 7 Router
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
          We'll pre-configure your high-performance WiFi 7 router with AI-optimized settings. 
          Choose your network name and password now — or let us generate them for you. 
          Your info will be printed on a sticker on the bottom of your router.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Skip Setup Option */}
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
          <Checkbox
            id="skip_setup"
            checked={skipSetup}
            onCheckedChange={handleSkipSetupChange}
          />
          <Label 
            htmlFor="skip_setup" 
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Skip setup - auto-generate network name and password for me
          </Label>
        </div>

        {!skipSetup && (
          <>
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
                  className="flex-1 px-4 py-3 text-base bg-green-50"
                />
                <Button
                  onClick={generateNetworkName}
                  className="px-4 py-3 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Or Generate Name for me
                </Button>
              </div>
            </div>

            {/* WiFi Password */}
            <div className="space-y-3">
              <Label htmlFor="wifi_passkey" className="text-lg font-medium text-gray-900">
                WiFi Password
              </Label>
              <div className="flex gap-3">
                <Input
                  id="wifi_passkey"
                  type="text"
                  value={wifiPasskey}
                  onChange={(e) => handlePasskeyChange(e.target.value)}
                  placeholder="Enter password (min 8 characters)"
                  className="flex-1 px-4 py-3 text-base bg-green-50"
                />
                <Button
                  onClick={generateSecurePasskey}
                  className="px-4 py-3 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Or Generate password for me
                </Button>
              </div>
              {passkeyError && (
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <span>❌</span> {passkeyError}
                </p>
              )}
            </div>
          </>
        )}

        {skipSetup && (
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 text-sm text-center">
              ✅ We'll automatically generate your WiFi name and password. You can find them on a sticker on your router when it arrives.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-6">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid || loading}
            className={`w-full py-4 text-lg font-semibold rounded-lg ${
              isFormValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Configuring Router...' : 'Continue to Router Selection'}
          </Button>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <p className="text-blue-800 text-sm text-center">
            🖨️ We'll print your WiFi name and password on a sticker placed on the bottom of your router, 
            so you'll always have access.
          </p>
        </div>
      </div>
    </div>
  );
};
