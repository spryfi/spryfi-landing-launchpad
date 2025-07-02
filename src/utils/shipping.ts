import { supabase } from '@/integrations/supabase/client';

interface ShippingRate {
  cost: number;
  estimatedDays: string;
  zoneName: string;
}

interface ShippingOrigin {
  city: string;
  state: string;
  zip: string;
}

// Cache for shipping data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = async <T>(key: string, fetchFunction: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

export const getShippingRate = async (state: string): Promise<ShippingRate> => {
  return getCachedData(`shipping-${state}`, async () => {
    // Hard fallback based on state zones since tables may not exist yet
    const shippingZones = {
      zone1: { states: ['TX', 'OK', 'AR', 'LA', 'NM'], rate: 12.95, days: '3' },
      zone2: { states: ['AZ', 'CA', 'NV', 'UT', 'CO', 'KS', 'MO', 'TN', 'MS', 'AL', 'GA', 'FL'], rate: 16.95, days: '5' },
      zone3: { states: ['WA', 'OR', 'ID', 'MT', 'WY', 'ND', 'SD', 'NE', 'IA', 'IL', 'IN', 'OH', 'KY', 'WV', 'VA', 'NC', 'SC'], rate: 19.95, days: '7' },
      zone4: { states: ['AK', 'HI', 'ME', 'VT', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC'], rate: 24.95, days: '10' }
    };

    for (const [zoneName, zone] of Object.entries(shippingZones)) {
      if (zone.states.includes(state)) {
        return {
          cost: zone.rate,
          estimatedDays: zone.days,
          zoneName: `Zone ${zoneName.slice(-1)} Shipping`
        };
      }
    }

    // Ultimate fallback
    return {
      cost: 16.95,
      estimatedDays: '5',
      zoneName: 'Standard Shipping'
    };
  });
};

export const getShippingOrigin = async (): Promise<ShippingOrigin> => {
  return getCachedData('shipping-origin', async () => {
    // For now, return defaults - can be enhanced when system_settings table exists
    return { city: 'Austin', state: 'TX', zip: '78701' };
  });
};